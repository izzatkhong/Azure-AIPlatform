using CognitiveSearch.Web.Configuration;
using CognitiveSearch.Web.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.PowerBI.Api.V2;
using Microsoft.PowerBI.Api.V2.Models;
using Microsoft.Rest;
using Newtonsoft.Json.Linq;
using System;
using System.Linq;
using System.Collections.Specialized;
using System.Diagnostics;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace CognitiveSearch.Web.Controllers
{
    public class FactoidSearchController : Controller
    {
        public static string _accessToken;
        public PowerBIViewModel powerBIViewModel;
        private readonly AppConfig _appConfig;

        public FactoidSearchController(AppConfig appConfig)
        {
            _appConfig = appConfig;

            if (powerBIViewModel == null)
            {
                powerBIViewModel = new PowerBIViewModel();
            }
        }

        public IActionResult Index()
        {
            if (Request.Query.ContainsKey("code"))
            {
                if (_accessToken == null)
                {
                    var authCode = Request.Query["code"][0];
                    Task.Run(async () => await GetAccessToken(authCode)).Wait();
                    powerBIViewModel.AccessToken = _accessToken;
                    Task.Run(async () => await EmbedReport()).Wait();
                }
                else
                {
                    // handle refresh in web page
                    powerBIViewModel.AccessToken = _accessToken;
                    Task.Run(async () => await EmbedReport()).Wait();
                }
            }
            else
            {
                var errorMessage = VerifySettings();
                if (string.IsNullOrEmpty(errorMessage))
                {
                    GetAuthorizationCode();
                }
                else
                {
                    // error in settings
                    Response.Redirect($"Error?message={errorMessage}");
                }
            }

            return View(powerBIViewModel);
        }

        private async Task EmbedReport()
        {
            using (var client = new PowerBIClient(new Uri(_appConfig.Authorization.PowerBIApiUrl), new TokenCredentials(powerBIViewModel.AccessToken, "Bearer")))
            {
                string groupId = (await client.Groups.GetGroupsAsync()).Value.FirstOrDefault()?.Id;

                if (string.IsNullOrEmpty(groupId))
                {
                    // no groups available for user
                    string message = "No group available, need to create a group and upload a report";
                    Response.Redirect($"Error?message={message}");
                }

                // getting first report in selected group from GetReports results
                var reports = await client.Reports.GetReportsInGroupAsync(groupId);
                Report report = reports.Value.Where(r => r.Name == "Wpi2-v5").FirstOrDefault();

                if (report != null)
                {
                    powerBIViewModel.EmbedUrl = "https://app.powerbi.com/reportEmbed?reportId=84bc73bf-a13c-43d2-a8a1-76b9f12dce41&autoAuth=true&ctid=68bcc9b2-d056-4374-a62d-0ad3b5296583&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXNvdXRoLWVhc3QtYXNpYS1iLXByaW1hcnktcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D";
                    powerBIViewModel.ReportId = report.Id;
                }
                else
                {
                    // no reports available for user in chosen group
                    // need to upload a report or insert a specific group id in appsettings.json
                    string message = "No report available in workspace with ID " + groupId + ", Please fill a group id with existing report in appsettings.json file";
                    Response.Redirect($"Error?message={message}");
                }
            }
        }

        private void GetAuthorizationCode()
        {
            var queryParams = new NameValueCollection
            {
                // Azure AD will return an authorization code. 
                {"response_type", "code"},

                // Client ID is used by the application to identify themselves to the users that they are requesting permissions from. 
                // You get the client id when you register your Azure app.
                {"client_id", _appConfig.Authorization.ApplicationId},

                // Resource uri to the Power BI resource to be authorized
                // The resource uri is hard-coded for sample purposes
                {"resource", _appConfig.Authorization.ResourceUrl},

                // After app authenticates, Azure AD will redirect back to the web app. In this sample, Azure AD redirects back
                // to Default page (Default.aspx).
                { "redirect_uri", _appConfig.Authorization.RedirectUrl + "/FactoidSearch"}
            };

            // Create sign-in query string
            var queryString = HttpUtility.ParseQueryString(string.Empty);
            queryString.Add(queryParams);

            // Redirect to Azure AD Authority
            //  Authority Uri is an Azure resource that takes a application id and application secret to get an Access token
            //  QueryString contains 
            //      response_type of "code"
            //      client_id that identifies your app in Azure AD
            //      resource which is the Power BI API resource to be authorized
            //      redirect_uri which is the uri that Azure AD will redirect back to after it authenticates

            // Redirect to Azure AD to get an authorization code
            Response.Redirect($"{_appConfig.Authorization.AuthorityUri} ?{queryString}");
        }

        private async Task GetAccessToken(string authCode)
        {
            using (var httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Add("Accept", "application/json");

                var requestBody = $"grant_type=authorization_code" +
                    $"&client_id={_appConfig.Authorization.ApplicationId}" +
                    $"&code = " + authCode +
                    $"&redirect_uri=" + _appConfig.Authorization.RedirectUrl + "/FactoidSearch" +
                    $"&resource={HttpUtility.UrlEncode(_appConfig.Authorization.ResourceUrl)}" +
                    $"&client_secret={"BmE9mbqkx./I7U]@d3pWKoyUAKnazoo9"}";
                    //$"&client_secret={"xqO@.Ti00BCjOYQlzN7AF2b=A.IqWb44"}";

                using (var response = await httpClient.PostAsync(_appConfig.Authorization.LoggingRequestUrl,
                    new StringContent(requestBody, Encoding.UTF8, "application/x-www-form-urlencoded")))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var result = JObject.Parse(await response.Content.ReadAsStringAsync());
                        _accessToken = result.Value<string>("access_token");
                    }
                    else
                    {
                        Response.Redirect("Error?message=Can't get access token");
                    }
                }
            }
        }

        private string VerifySettings()
        {
            string message = null;
            Guid result;

            // Application Id must have a value.
            if (string.IsNullOrWhiteSpace(_appConfig.Authorization.ApplicationId))
            {
                message = "ApplicationId is empty. please register your application as Native app in https://dev.powerbi.com/apps and fill application Id in appsettings.json";
            }
            else
            {
                // Application Id must be a Guid object.
                if (!Guid.TryParse(_appConfig.Authorization.ApplicationId, out result))
                {
                    message = "ApplicationId must be a Guid object. please register your application as Native app in https://dev.powerbi.com/apps and fill application Id in appsettings.json";
                }
            }

            //// Workspace Id must be a Guid object.
            //if (!string.IsNullOrWhiteSpace(_appConfig.Authorization.GroupId))
            //{
            //    if (!Guid.TryParse(AppSettings.GroupId, out result))
            //    {
            //        message = "GroupId must be a Guid object. Please select a group you own and fill its Id in appsettings.json";
            //    }
            //}

            // All urls must have value
            if (string.IsNullOrWhiteSpace(_appConfig.Authorization.PowerBIApiUrl) || string.IsNullOrWhiteSpace(_appConfig.Authorization.AuthorityUri) ||
                string.IsNullOrWhiteSpace(_appConfig.Authorization.RedirectUrl) || string.IsNullOrWhiteSpace(_appConfig.Authorization.ResourceUrl) || string.IsNullOrWhiteSpace(_appConfig.Authorization.LoggingRequestUrl))
            {
                message = "One or more of the urls required are missing. Please check appsettings.json file. for more info check sample instructions in https://github.com/Microsoft/PowerBI-Developer-Samples";
            }

            return message;
        }
        //**/
    }
}
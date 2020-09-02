namespace CognitiveSearch.Web.Configuration
{
    public class AuthorizationConfig
    {
        public string AuthorityUri { get; set; }
        public string ResourceUrl { get; set; }
        public string RedirectUrl { get; set; }
        public string PowerBIApiUrl { get; set; }
        public string ApplicationId { get; set; }
        public string LoggingRequestUrl { get; set; }
    }
}
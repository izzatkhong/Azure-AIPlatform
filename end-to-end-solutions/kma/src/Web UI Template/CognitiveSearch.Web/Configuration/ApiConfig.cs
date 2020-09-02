namespace CognitiveSearch.Web.Configuration
{
    public class ApiConfig
    {
        //public string Protocol { get; set; } = "https";
        public string BaseUrl { get; set; }
        public string Url => 
           BaseUrl.EndsWith("/")
            ? $"{BaseUrl}api"
            : $"{BaseUrl}/api";

        public string MrcApiUrl { get; set; }
        public string DocEntitiesApiUrl { get; set; }
        public string WidgetApiUrl { get; set; }
    }
}
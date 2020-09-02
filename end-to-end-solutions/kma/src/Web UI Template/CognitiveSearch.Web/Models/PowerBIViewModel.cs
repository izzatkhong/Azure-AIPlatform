using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CognitiveSearch.Web.Models
{
    public class PowerBIViewModel
    {
        public string EmbedUrl { get; set; }
        public string AccessToken { get; set; }
        public string ReportId { get; set; }
    }
}

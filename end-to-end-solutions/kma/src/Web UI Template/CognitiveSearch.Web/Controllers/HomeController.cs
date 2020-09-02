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
    public class HomeController : Controller
    {
        private readonly AppConfig _appConfig;

        public HomeController(AppConfig appConfig)
        {
            _appConfig = appConfig;
        }

        public IActionResult Index()
        {
            return View();
        }
    }
}
namespace WatExtensions.SuperCache
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Reflection;
    using System.Text.RegularExpressions;

    using HtmlAgilityPack;
    using Windows.Storage;
    using WatExtensions.SuperCache.Config;

    internal class HtmlProcessor
    {
        private WebServer server;
        private IEnumerable<string> bypassUrlPatterns;
        private Uri baseUri;
        private HtmlDocument document;

        public HtmlProcessor(string html, WebServer server, Uri baseUri, IEnumerable<string> bypassUrlPatterns)
        {
            this.server = server;
            this.bypassUrlPatterns = bypassUrlPatterns;
            this.baseUri = baseUri;

            this.document = new HtmlDocument();
            this.document.LoadHtml(html);
        }

        public void RedirectLinks(Uri baseUri)
        {
            if (this.document.DocumentNode != null)
            {
                var nodes = this.document.DocumentNode.Descendants()
                    .Where(p =>
                    {
                        if (p.Name == "a" && p.GetAttributeValue("href", null) != null)
                        {
                            return true;
                        }
                        else if (p.Name == "link" && p.GetAttributeValue("rel", null) == "stylesheet")
                        {
                            return true;
                        }
                        else if ((p.Name == "script" || p.Name == "img" || p.Name == "iframe") && p.GetAttributeValue("src", null) != null)
                        {
                            return true;
                        }
                        else if (p.Name == "form" && p.GetAttributeValue("action", null) != null)
                        {
                            return true;
                        }

                        return false;
                    });

                foreach (var element in nodes)
                {
                    var attributeName = element.Name == "a" || element.Name == "link" ? "href" : (element.Name == "form" ? "action" : "src");
                    var attribute = element.GetAttributeValue(attributeName, null);
                    if (attribute != null)
                    {
                        if (!this.BypassUrl(attribute))
                        {
                            var linkUrl = this.server.BuildCurrentProxyUri(baseUri, attribute);
                            if (linkUrl != null)
                            {
                                element.Attributes[attributeName].Value = linkUrl;
                            }
                        }
                        else if (attribute.StartsWith("/", StringComparison.Ordinal))
                        {
                            // make absolute URL to bypass localhost super-cache domain
                            var linkUrl = new Uri(this.baseUri, attribute);
                            element.Attributes[attributeName].Value = linkUrl.ToString();
                        }
                    }
                }
            }
        }

        public void InjectHtml(string script)
        {
            if (this.document.DocumentNode != null)
            {
                var head = this.document.DocumentNode.Descendants().FirstOrDefault(p => p.Name == "head");
                if (head != null)
                {
                    var scriptNode = this.document.CreateTextNode(script);
                    head.PrependChild(scriptNode);
                }
            }
        }

        public string GetContent()
        {
            string result = null;
            using (var writer = new StringWriter())
            {
                this.document.Save(writer);
                result = writer.ToString();
            }

            return result;
        }

        public void AddOfflineClass()
        {
            if (this.document.DocumentNode != null)
            {
                var body = this.document.DocumentNode.Descendants().FirstOrDefault(p => p.Name == "body");
                if (body != null)
                {
                    var classes = body.GetAttributeValue("class", string.Empty);
                    classes = string.Concat("wat_offlinemode ", classes).Trim();

                    body.SetAttributeValue("class", classes);
                }
            }
        }

        private bool BypassUrl(string url)
        {
            if (this.bypassUrlPatterns != null)
            {
                return this.bypassUrlPatterns.Any(urlPattern => Regex.IsMatch(url, urlPattern));
            }
            else
            {
                return false;
            }
        }
    }
}

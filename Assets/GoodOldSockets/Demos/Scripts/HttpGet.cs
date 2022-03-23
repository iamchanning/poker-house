using System;
using System.Text;
using LostPolygon.System.Net;
using LostPolygon.System.Net.Sockets;
using System.Threading;
using UnityEngine;

namespace LostPolygon.GoodOldSockets.Examples {
    [ExecuteInEditMode]
    public class HttpGet : MonoBehaviour {
        public GUISkin Skin;
        private string _address = "unity3d.com";
        private string _pageContent = string.Empty;
        private string _threadState = "<color=black>none.</color>";

        private Vector2 _logPosition = Vector2.zero;
        private Thread _currentGetThread; // The page retrieval thread

        // Some GUI stuff
        private void OnGUI() {
            #region GUI stuff
            if (Skin != null)
                GUI.skin = Skin;

            float width = Mathf.Min(350f, Screen.width);
            float height = Mathf.Min(550f, Screen.height);
            float scaleFactor = SocketExamplesTools.UpdateGuiScaleMobile(height, width);

            GUILayout.BeginArea(
                new Rect(
                    Screen.width / 2f / scaleFactor - width / 2f,
                    Screen.height / 2f / scaleFactor - height / 2f, 
                    width, 
                    height
                    ),
                "HTTP GET example", "Window"
                );

            GUILayout.BeginVertical();

            GUILayout.Label(
                "<color=black>" +
                "This example demonstrates usage of TCP sockets and threads " +
                "in order to request and receive a page over HTTP protocol (commonly used in Web). " +
                "</color>"
                );

            GUILayout.Space(5f);
            GUILayout.BeginHorizontal();
            GUILayout.Label("<color=black>http://</color>", GUILayout.Width(35f), GUILayout.Height(29f));
            _address = GUILayout.TextField(_address);
            GUILayout.EndHorizontal();
            GUILayout.Space(5f);

            #endregion
            if (GUILayout.Button("Request page", GUILayout.Height(30f))) {
                _pageContent = string.Empty;
                // Request a page
                RequestPage(_address, OnThreadFinishedCallback);
            }
            #region GUI stuff
            GUILayout.Space(5f);

            GUILayout.Label("<color=black><b>Current state:</b></color> " + _threadState);
            SocketExamplesTools.TouchScroll(ref _logPosition);
            _logPosition = GUILayout.BeginScrollView(_logPosition);
            GUILayout.Label(_pageContent);
            GUILayout.EndScrollView();
            GUILayout.EndVertical();

            GUILayout.EndArea();
            #endregion
        }

        // Returns a connected socket on success
        // or null on failure
        private Socket ConnectSocket(string server, int port) {
            Socket s = null;

            // Get host related information.
            IPHostEntry hostEntry = Dns.GetHostEntry(server);

            // Loop through the AddressList to obtain the supported AddressFamily. This is to avoid
            // an exception that occurs when the host IP Address is not compatible with the address family
            // (typical in the IPv6 case).


            foreach (IPAddress address in hostEntry.AddressList) {
                IPEndPoint ipEndPoint = new IPEndPoint(address, port);
                // Trying to create a socket and connect
                Socket tempSocket =
                    new Socket(ipEndPoint.AddressFamily, SocketType.Stream, ProtocolType.Tcp);

                tempSocket.Connect(ipEndPoint);

                if (tempSocket.Connected) {
                    s = tempSocket;
                    break;
                }
            }
            return s;
        }

        // Requests the page content for the specified server and port.
        private string SocketSendReceive(string server, int port, string page) {
            // Constructing a HTTP GET request
            string request = string.Format("GET {0} HTTP/1.1\r\nHost: " + server +
                                           "\r\nConnection: Close\r\n\r\n", page);

            // Creating send/receive buffers
            Byte[] bytesSent = Encoding.UTF8.GetBytes(request);
            Byte[] bytesReceived = new Byte[256];

            // Create a socket connection with the specified server and port.
            Socket s = ConnectSocket(server, port);

            if (s == null)
                return ("Connection failed");

            // Send request to the server.
            s.Send(bytesSent, bytesSent.Length, 0);

            // Receive the server home page content.
            int bytes;
            string content = string.Empty;

            // The following will block until te page is transmitted.
            do {
                bytes = s.Receive(bytesReceived, bytesReceived.Length, 0);
                content = content + Encoding.UTF8.GetString(bytesReceived, 0, bytes);
            } while (bytes > 0);

            return content;
        }

        // The main page retrieval procedure
        private void ThreadGet(string server, int port, string page, Action<HttpGetResultType, string> callback) {
            callback(HttpGetResultType.InProgress, string.Empty);
            try {
                // Try to receive the page and return it
                string result = SocketSendReceive(server, port, page);
                callback(HttpGetResultType.FinishedSuccess, result);
            } catch (Exception e) {
                // Returning the exception message
                callback(HttpGetResultType.FinishedError, e.Message);
            }
        }

        // This is triggered by ThreadGet() on events
        private void OnThreadFinishedCallback(HttpGetResultType resultType, string content) {
            switch (resultType) {
                case HttpGetResultType.InProgress:
                    _threadState = "<color=black>retrieving page...</color>";
                    break;
                case HttpGetResultType.FinishedSuccess:
                    _threadState = "<color=black>page received succesfully.</color>";
                    string truncatedContent = TruncateString(content, 10000);
                    if (truncatedContent.Length != content.Length)
                        truncatedContent += "\r\n\r\n...\r\n\r\n<color=black><rest of content not shown></color>";
                    _pageContent = string.Format("<color=black>{0}</color>", truncatedContent);
                    break;
                case HttpGetResultType.FinishedError:
                    _threadState = @"<color=black>an error occured while retrieving the page.</color>";
                    _pageContent = string.Format("<color=red>{0}</color>", content);
                    break;
            }
        }

        private void RequestPage(string uri, Action<HttpGetResultType, string> callback) {
            // Parse the URL
            Uri link = new Uri("http://" + uri);

            // Abort the current retrieval thread, if any
            if (_currentGetThread != null && _currentGetThread.IsAlive)
                _currentGetThread.Abort();

            // Start a page retrieval thread
            _currentGetThread = new Thread(() => ThreadGet(link.Host, link.Port, link.PathAndQuery, callback));
            _currentGetThread.IsBackground = true;
            _currentGetThread.Start();
        }

        private static string TruncateString(string str, int length) {
            if (str.Length <= length)
                return str;

            return str.Substring(0, length);
        }

        // The current state of the page retrieval thread
        private enum HttpGetResultType {
            InProgress,
            FinishedSuccess,
            FinishedError
        }
    }
}
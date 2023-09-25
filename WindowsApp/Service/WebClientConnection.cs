using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using Test.ViewModel;

namespace Test.Model;

public class WebClientConnection : RelayBase, IDisposable
{
    private SocketIOClient.SocketIO client;
    private bool _isConnected;
    private string? _webClientMessage;
    private CancellationTokenSource cancellationTokenSource;
    
    public bool IsConnected
    {
        get => _isConnected;
        set
        {
            if (_isConnected == value) return;
            _isConnected = value;
            OnPropertyChanged(nameof(IsConnected));
        }
    }

    public string? WebClientMessage
    {
        get => _webClientMessage;
        set
        {
            if (_webClientMessage != value)
            {
                _webClientMessage = value;
                OnPropertyChanged(nameof(WebClientMessage));
            }
        }
    }

    public WebClientConnection(string url)
    {
        client = new SocketIOClient.SocketIO(new Uri(url));
        client.OnConnected += Client_OnConnected;
        client.OnDisconnected += Client_OnDisconnected;
        client.OnError += Client_OnError;
        cancellationTokenSource = new CancellationTokenSource();
    }

    private void Client_OnConnected(object sender, EventArgs e)
    {
        Console.WriteLine("Connected to Socket.IO server");
    }

    private void Client_OnDisconnected(object sender, string e)
    {
        Console.WriteLine($"Disconnected from Socket.IO server: {e}");
        IsConnected = false;
        ReconnectWithRetryAsync();
    }

    private void Client_OnError(object sender, string e)
    {
        Console.WriteLine($"Socket.IO error: {e}");
        IsConnected = false;
        ReconnectWithRetryAsync();
    }

    public async Task ConnectAsync()
    {
        await client.ConnectAsync();
        IsConnected = true;
    }

    public async Task DisconnectAsync()
    {
        await client.DisconnectAsync();
        IsConnected = true;
    }

    public async Task SendMessageAsync(string eventName, SocketPayload payload)
    {
        Console.WriteLine($"Sending {eventName} {payload}");
        await client.EmitAsync(eventName, payload);
    }

    public void HandleMessage(string eventName, Action<SocketPayload> handler)
    {
        client.On(eventName, (data) =>
        {
            if (data != null)
            {
                handler?.Invoke(data.GetValue<SocketPayload>());
            }
        });
    }
    
    private async Task ReconnectWithRetryAsync()
    {
        const int maxRetryAttempts = 5; // Maximum number of retry attempts
        const int retryDelaySeconds = 5; // Delay between each retry in seconds
        int retryCount = 0;

        while (retryCount < maxRetryAttempts)
        {
            Console.WriteLine($"Retrying connection (attempt {retryCount + 1}/{maxRetryAttempts})...");
            await ConnectAsync();

            if (IsConnected)
            {
                Console.WriteLine("Reconnected successfully.");
                break;
            }

            retryCount++;
            await Task.Delay(retryDelaySeconds * 1000); // Wait for the specified delay.
        }

        if (!IsConnected)
        {
            Console.WriteLine("Failed to reconnect after maximum attempts.");
        }
    }
    
    public void Dispose()
    {
        cancellationTokenSource.Cancel(); // Cancel any ongoing operations when disposing.
        client.Dispose();
    }
}

public class SocketPayload : IPayload<object>
{
    public string type { get; set; }
    public object payload { get; set; }
}


public class MessagePayload
{
    public string lastSentMessage { get; set; }
}

public interface IPayload<T>
{
    string type { get; set; }
    T payload { get; set; }
}
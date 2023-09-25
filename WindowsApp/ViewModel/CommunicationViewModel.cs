using System;
using System.Net.Sockets;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using System.Windows.Input;
using System.Text.Json;
using Test.Model;

namespace Test.ViewModel;

public class CommunicationViewModel : RelayBase
{
    private readonly WebClientConnection _client;
    private string? _message;
    private string? _webClientMessage;
    private string? _notification;
    // TODO set url as needed
    private string _url = "http://localhost:3000/";

    // Constructor
    public CommunicationViewModel()
    {
        SendMessageCommand = new ViewModelCommand(ExecuteMessageCommand, CanExecuteMessageCommand);

        using (var client = new WebClientConnection(_url))
        {
            _client = client;
            // let url by customizable by view
            _client = new WebClientConnection(_url);
            _client.PropertyChanged += (sender, e) =>
            {
                OnPropertyChanged(e.PropertyName);
            };
        
            // connect
            _client.ConnectAsync();
        
            // setup message handler
            _client.HandleMessage("event", (data) =>
            {
                Console.WriteLine($"Received message: {data.type} {data.payload}");
                // type cast data
                if (data.payload is System.Text.Json.JsonElement jsonElement)
                {
                    MessagePayload messagePayload =
                        JsonSerializer.Deserialize<MessagePayload>(jsonElement.GetRawText());
                    WebClientMessage = messagePayload.lastSentMessage;
                }
            });
        }
    }

    // Properties
    public string Message
    {
        get => _message;
        set
        {
            if (value == _message)
                return;
            _message = value;
            OnPropertyChanged(nameof(Message));
        }
    }

    public string? Notification
    {
        get => _notification;
        set
        {
            if (value == _notification)
                return;
            _notification = value;
            OnPropertyChanged(nameof(Notification));
        }
    }

    public bool? IsConnected
    {
        get { return _client.IsConnected; }
    }
        
    public string? WebClientMessage
    {
        get { return _webClientMessage; }
        set
        {
            if (value == _webClientMessage)
                return;
            _webClientMessage = value;
            OnPropertyChanged(nameof(WebClientMessage));
        }
    }
        

    // -> Commands
    public ICommand SendMessageCommand { get; }

    /**
     * checks if message is set before executing the command
     */
    private bool CanExecuteMessageCommand(object obj)
    {
        return !string.IsNullOrWhiteSpace(Message);
    }

    private async void ExecuteMessageCommand(object obj)
    {
        if (_client.IsConnected)
        {
            var payload = new SocketPayload
            {
                type = "sendToWeb",
                payload = new MessagePayload()
                {
                    lastSentMessage = Message
                }// Replace with your desired payload data of type int
            };
            
            await _client.SendMessageAsync("event", payload);
            ShowNotification("Nachricht erfolgreich gesendet");
        }
    }

    private async Task ShowNotification(string notification)
    {
        Notification = notification;
        await Task.Delay(2000);
        Notification = "";
    }
}
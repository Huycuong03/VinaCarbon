export default function BotPage() {
    return (
        <iframe 
        src={`https://webchat.botframework.com/embed/agent-bot78106?s=${process.env.AZURE_BOT_SECRET}`}  
        style={{minWidth: "400px", width: "100%", minHeight: "500px", height: "80vh", padding: "20px"}}>
        </iframe>
    );
}
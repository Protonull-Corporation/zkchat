import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { contractConfig } from '../../config/config'

interface Message {
  sender: `0x${string}`;
  timestamp: bigint;
  msg: string;
}

interface ChatWindowProps {
  selectedUser: { pubkey: string; name: string } | null;
}

export function ChatWindow({ selectedUser }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const { address } = useAccount()

  function formatAddress(address: string): `0x${string}` {
    return address.toLowerCase().startsWith('0x') 
      ? address.toLowerCase() as `0x${string}`
      : `0x${address.toLowerCase()}` as `0x${string}`;
  }

  const { data: chatMessages, refetch } = useReadContract({
    ...contractConfig,
    functionName: 'readMessage',
    args: selectedUser ? [formatAddress(selectedUser.pubkey)] : undefined,
  })

  const { writeContract } = useWriteContract()

  useEffect(() => {
    if (chatMessages && Array.isArray(chatMessages)) {
      setMessages(chatMessages as Message[])
    }
  }, [chatMessages])

  const handleSend = async () => {
    if (newMessage.trim() && selectedUser) {
      try {
        await writeContract({
          ...contractConfig,
          functionName: 'sendMessage',
          args: [formatAddress(selectedUser.pubkey), newMessage],
        })
        setNewMessage('')
        setTimeout(() => refetch(), 1000) // Refetch messages after sending
      } catch (error) {
        console.error("Error sending message:", error)
      }
    }
  }

  if (!selectedUser) {
    return <div className="flex items-center justify-center h-full">Select a user to start chatting</div>
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${msg.sender.toLowerCase() === address?.toLowerCase() ? 'text-right' : 'text-left'}`}
          >
            <span className={`inline-block p-2 rounded-lg ${
              msg.sender.toLowerCase() === address?.toLowerCase() ? 'bg-primary text-primary-foreground' : 'bg-secondary'
            }`}>
              {msg.msg}
            </span>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
    </div>
  )
}
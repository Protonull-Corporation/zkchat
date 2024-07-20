"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MoreHorizontal, SquarePen, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Avatar, AvatarImage } from "./ui/avatar";
import { ConnectKitButton } from "connectkit";
import {  useReadContract, useWriteContract } from 'wagmi';
import abi from "@/config/config-abi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAccount } from 'wagmi'; // Add this import

const CONTRACT_ADDRESS = '0x97F758Ef7A433AbCc4D2455bAC7F115e396a9273';
const CONTRACT_ABI = abi;


interface Friend {
  pubkey: string;
  name: string;
}
type ContractMessage = {
  sender: `0x${string}`;
  timestamp: bigint;
  msg: string;
};

// Update your Message type if necessary
interface Message {
  sender: string;
  timestamp: number;
  message: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  isMobile: boolean;
  onSelectUser: (user: Friend) => void;  // Add this new prop
}
export function Sidebar({ isCollapsed, isMobile, onSelectUser }: SidebarProps) {
    const [links, setLinks] = useState<{
    name: string;
    messages: Message[];
    avatar: string;
    variant: "grey" | "ghost";
  }[]>([]);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const { address } = useAccount(); // Get the connected wallet address
  const [username, setUsername] = useState<string | undefined>(undefined);

  const [friendPubkey, setFriendPubkey] = useState("");
  const [friendName, setFriendName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  function formatAddress(address: string): `0x${string}` {
    if (address.startsWith('0x')) {
      return address as `0x${string}`;
    }
    return `0x${address}` as `0x${string}`;
  }

  const { data: fetchedUsername } = useReadContract({
    abi,
    address: CONTRACT_ADDRESS,
    functionName: 'getUsername',
    args: address ? [address] : undefined,
  });


  useEffect(() => {
    if (fetchedUsername && typeof fetchedUsername === 'string') {
      setUsername(fetchedUsername);
    }
  }, [fetchedUsername]);


  const { data: userExists } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'checkUserExists',
    args: friendPubkey ? [formatAddress(friendPubkey)] : undefined,
  });
  const [friends, setFriends] = useState<Friend[]>([]);
  const {data: friendList} = useReadContract({
abi,
    address: CONTRACT_ADDRESS,
    functionName: 'getFriendList',
    args: address ? [address] : undefined,
  });
  
  useEffect(() => {
    console.log("Friend list data:", friendList);
    if (friendList && Array.isArray(friendList)) {
      setFriends(friendList);
    }
  }, [friendList]);
  const { writeContract } = useWriteContract();
  useEffect(() => {
    if (friendList && Array.isArray(friendList)) {
      setFriends(friendList);
    }
  }, [friendList]);
  const [messages, setMessages] = useState<{ [pubkey: string]: Message[] }>({});



  // useEffect(() => {
  //   if (friends.length > 0) {
  //     friends.forEach((friend) => {
  //       const formattedPubkey = formatAddress(friend.pubkey);
  //       const { data: friendMessages } = useReadContract({
  //         address: CONTRACT_ADDRESS,
  //         abi: CONTRACT_ABI,
  //         functionName: 'readMessage',
  //         args: [formattedPubkey],
  //       });

  //       if (friendMessages) {
  //         const formattedMessages: Message[] = (friendMessages as ContractMessage[]).map(msg => ({
  //           sender: msg.sender,
  //           timestamp: Number(msg.timestamp),
  //           message: msg.msg
  //         }));

  //         setMessages(prevMessages => ({
  //           ...prevMessages,
  //           [friend.pubkey]: formattedMessages
  //         }));
  //       }
  //     });
  //   }
  // }, [friends]);

  useEffect(() => {
    if (friends.length > 0 && Object.keys(messages).length > 0) {
      const newLinks = friends.map((friend) => ({
        name: friend.name,
        messages: messages[friend.pubkey] || [],
        avatar: `https://robohash.org/${friend.pubkey}`,
        variant: "grey" as const,
      }));
      setLinks(newLinks);
    }
  }, [friends, messages]);
  const handleAddFriend = async () => {
    if (!friendPubkey) {
      setErrorMessage("Please enter a valid public key");
      return;
    }
  
    const formattedPubkey = formatAddress(friendPubkey);
  
    if (!userExists) {
      setErrorMessage("User does not exist");
      console.log("User doesn't exist");
      return;
    }
  
    try {
      await writeContract({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: 'addFriend',
        args: [formattedPubkey, friendName],
      });
      setIsAddFriendModalOpen(false);
      setFriendPubkey("");
      setFriendName("");
      setErrorMessage("");
    } catch (error) {
      console.error("Error adding friend:", error);
      setErrorMessage("Error adding friend. Please try again.");
    }
  };

  // if (isLoading) return <div>Loading...</div>;
  // if (isError) return <div>Error fetching friends</div>;

  return (
    <div
      data-collapsed={isCollapsed}
      className="relative group flex flex-col h-full gap-4 p-2 data-[collapsed=true]:p-2 "
    >
      <ConnectKitButton />
      {!isCollapsed && (
        <>
          <div className="flex justify-between p-2 items-center">
            <div className="flex gap-2 items-center text-2xl">
              <p className="font-medium">
                {username ? `Welcome, ${username}` : "Welcome"}
              </p>
            </div>
          </div>
          <div className="flex justify-between p-2 items-center">
            <div className="flex gap-2 items-center text-2xl">
              <p className="font-medium">Chats</p>
              <span className="text-zinc-300">({friendList?.length})</span>
            </div>

            <div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddFriendModalOpen(true)}
              >
                <UserPlus size={20} />
              </Button>
              {/* <Link
                href="#"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "h-9 w-9"
                )}
              >
                <MoreHorizontal size={20} />
              </Link>
              <Link
                href="#"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "h-9 w-9"
                )}
              >
                <SquarePen size={20} />
              </Link> */}
            </div>
          </div>
        </>
      )}
<nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {friends.map((friend, index) =>
          isCollapsed ? (
            <TooltipProvider key={index}>
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                <button
  key={index}
  onClick={() => onSelectUser(friend)}
  className={cn(
    buttonVariants({ variant: "grey", size: "xl" }),
    "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink",
    "justify-start gap-4"
  )}
>
                    <Avatar className="flex justify-center items-center">
                      <AvatarImage
                        src={`https://robohash.org/${friend.pubkey}`}
                        alt={friend.name}
                        width={6}
                        height={6}
                        className="w-10 h-10 "
                      />
                    </Avatar>{" "}
                    <span className="sr-only">{friend.name}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center gap-4"
                >
                  {friend.name}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <button
            key={index}
            onClick={() => onSelectUser(friend)}
            className={cn(
              buttonVariants({ variant: "grey", size: "xl" }),
              "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink",
              "justify-start gap-4"
            )}
          >
              <Avatar className="flex justify-center items-center">
                <AvatarImage
                  src={`https://robohash.org/${friend.pubkey}`}
                  alt={friend.name}
                  width={6}
                  height={6}
                  className="w-10 h-10 "
                />
              </Avatar>
              <div className="flex flex-col max-w-28">
                <span>{friend.name}</span>
              </div>
            </button>
          )
        )}
      </nav>


      <Dialog open={isAddFriendModalOpen} onOpenChange={setIsAddFriendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Friend</DialogTitle>
            <DialogDescription>Enter your friend's public key and name to add them.</DialogDescription>
          </DialogHeader>
          <Input 
            placeholder="Friend's Public Key" 
            value={friendPubkey} 
            onChange={(e) => setFriendPubkey(e.target.value)} 
          />
          <Input 
            placeholder="Friend's Name" 
            value={friendName} 
            onChange={(e) => setFriendName(e.target.value)} 
          />
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <Button onClick={handleAddFriend}>Add Friend</Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
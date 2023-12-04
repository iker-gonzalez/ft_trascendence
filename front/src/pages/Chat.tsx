import React, { useState, useEffect } from 'react';
import ChatSidebar from '../components/Chat/ChatSidebar';
import ChatMessageArea from '../components/Chat/ChatMessageArea';
import Group from '../interfaces/chat-group.interface';
import User from '../interfaces/chat-user.interface';
import DirectMessage from '../interfaces/chat-message.interface';
import GroupMessage from '../interfaces/chat-group-message.interface';
import { useUserData } from '../context/UserDataContext';
import { getUsernameFromIntraId } from '../utils/utils';
import CenteredLayout from '../components/UI/CenteredLayout';
import styled from 'styled-components';
import useChatMessageSocket, {
  UseChatMessageSocket,
} from '../components/Chat/useChatMessageSocket';
import { Socket } from 'socket.io-client';
import { useChatData, useMessageData } from '../context/ChatDataContext';
import { ChannelData } from '../interfaces/chat-channel-data.interface';
import { useChannelData } from '../context/ChatDataContext';
import { useNavigate } from 'react-router-dom';

const WrapperDiv = styled.div`
  width: 100%;
  height: 80vh; /* TODO adjust this */
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 40px;
`;

/**
 * ChatPage component that displays the chat sidebar and message area.
 * @returns React functional component.
 */
const Chat: React.FC = () => {
  const navigate = useNavigate();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);

  const [messages, setMessages] = useState<DirectMessage[]>([]);

  const { userData } = useUserData();

  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [channelData, setChannelData] = useState<ChannelData | null>(null);

  // Initialize state variables
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isConnectionError, setIsConnectionError] = useState(false);

  // Call useChatMessageSocket at the top level of your component
  const {
    chatMessageSocketRef,
    isSocketConnected: connected,
    isConnectionError: error,
  }: UseChatMessageSocket = useChatMessageSocket();

  useEffect(() => {
    if (!userData) {
      navigate('/');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Update state variables
    setSocket(chatMessageSocketRef.current);
    setIsSocketConnected(connected);
    setIsConnectionError(error);
  }, [chatMessageSocketRef, connected, error]);

  const { fetchDirectMessageUsers, fetchUserGroups, fetchAllGroups } =
    useChatData();

  const [updateChatData, setUpdateChatData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const users = await fetchDirectMessageUsers();
      setUsers(users);

      const userGroups = await fetchUserGroups();
      setUserGroups(userGroups);

      const allGroups = await fetchAllGroups();
      setAllGroups(allGroups);
    };

    fetchData();
  }, [updateChatData]);

  const { fetchUserMessages, fetchGroupMessages } = useMessageData();
  const { fetchChannelData } = useChannelData();

  const handleUserClick = async (user: User) => {
    // console.log('handleUserClick');
    const users = await fetchDirectMessageUsers();
    // console.log('users:', users);
    setUsers(users);

    const userExists = users.some((u: User) => u.intraId === user.intraId);

    if (!userExists) {
      setUsers((prevUsers) => [...prevUsers, user]);
    }

    const directMessages: DirectMessage[] = await fetchUserMessages(user);
    setSelectedUser(user);
    setSelectedGroup(null);
    // console.log('directMessages', directMessages);
    setMessages(directMessages);
  };

  const handleGroupClick = async (group: Group) => {
    const groupInfo = await fetchGroupMessages(group);
    const channelData = await fetchChannelData(group.name);
    const groupMessages: DirectMessage[] = groupInfo.channelMessage;
    setSelectedGroup(group);
    setSelectedUser(null);
    // console.log('groupMessages', groupMessages);
    setMessages(groupMessages);
    setChannelData(channelData);
  };

  const [unreadMessages, setUnreadMessages] = useState<{
    [key: string]: number;
  }>(() => {
    const savedUnreadMessages = localStorage.getItem('unreadMessages');
    return savedUnreadMessages ? JSON.parse(savedUnreadMessages) : {};
  });

  const [newMessageSent, setNewMessageSent] = useState(false);

  useEffect(() => {
    // console.log('unread messages stored in local storage');
    localStorage.setItem('unreadMessages', JSON.stringify(unreadMessages));
  }, [unreadMessages]);

  useEffect(() => {
    if (isSocketConnected && socket) {

      const privateMessageListener = (messageData: string) => {
        const parsedNewMessage = JSON.parse(messageData);
        setMessages(prevMessages => [...prevMessages, parsedNewMessage]);
      };

      const groupMessageListener = (messageData: GroupMessage) => {
        console.log('group message listener triggered');
        console.log('GroupmessageData', messageData);
        //const parsedNewMessage = JSON.parse(messageData);
        //setMessages(prevMessages => [...prevMessages, messageData]);

        // if (!selectedGroup) {
        //   // console.log('no selected group');
        //   return;
        // }
      };

      socket.on(
        `privateMessageReceived/${userData?.intraId.toString()}`,
        privateMessageListener,
      );

      socket.on('message', groupMessageListener);

      return () => {
        if (socket) {
          // console.log('cleaning up listeners');
          socket.off(
            `privateMessageReceived/${userData?.intraId.toString()}`,
            privateMessageListener,
          );
          socket.off('message', groupMessageListener);
        }
      };
    }
  }, [newMessageSent, isSocketConnected]);

  function updateUserSidebar() {
    setUpdateChatData((prevState) => !prevState);
  }

  return (
    <CenteredLayout>
      <WrapperDiv>
        <ChatSidebar
          users={users}
          userGroups={userGroups}
          updateUserSidebar={updateUserSidebar}
          allGroups={allGroups}
          handleUserClick={handleUserClick}
          handleGroupClick={handleGroupClick}
          unreadMessages={unreadMessages}
          selectedUser={selectedUser}
          selectedGroup={selectedGroup}
          socket={socket}
        />
        <ChatMessageArea
          selectedUser={selectedUser}
          users={users}
          selectedGroup={selectedGroup}
          messages={messages}
          updateUserSidebar={updateUserSidebar}
          onNewMessage={(newMessage: DirectMessage | GroupMessage) => {
            setNewMessageSent((prevNewMessageSent) => !prevNewMessageSent);
            if (selectedUser) {
              // console.log('new direct message?: ', newMessage);
              handleUserClick(selectedUser);
            } else if (selectedGroup) {
              // console.log('new group message?: ', newMessage);
              handleGroupClick(selectedGroup);
            }
          }}
          onBlockUserChange={() => {
            if (selectedUser) {
              handleUserClick(selectedUser);
            }
          }}
          socket={socket}
          setSelectedUser={setSelectedUser}
          setSelectedGroup={setSelectedGroup}
          channelData={channelData}
        />
      </WrapperDiv>
    </CenteredLayout>
  );
};

export default Chat;

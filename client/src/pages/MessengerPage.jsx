import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { io } from 'socket.io-client';
import { format } from 'date-fns';
import {
  MessageCircle, Search, User, Loader2, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { metaService } from '../services/metaService';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { autoConnect: false });

export default function MessengerPage() {
  const queryClient = useQueryClient();
  const [selectedPsid, setSelectedPsid] = useState('');
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  const { data: inbox, isLoading: loadingInbox, refetch: refetchInbox } = useQuery(
    'messenger-inbox',
    metaService.getMessengerInbox,
    { refetchInterval: 15000 }
  );

  const { isLoading: loadingConvo } = useQuery(
    ['messenger-convo', selectedPsid],
    () => metaService.getMessengerConversation(selectedPsid),
    {
      enabled: !!selectedPsid,
      onSuccess: (res) => setMessages(res.data || []),
    }
  );

  useEffect(() => {
    socket.connect();
    socket.on('facebook:message_received', (msg) => {
      if (msg.conversationId === selectedPsid) {
        setMessages((prev) => {
          if (prev.some((m) => m.metaMessageId === msg.metaMessageId)) return prev;
          return [...prev, msg];
        });
      }
      queryClient.invalidateQueries('messenger-inbox');
      queryClient.invalidateQueries('leads');
    });
    socket.on('lead:created', () => {
      queryClient.invalidateQueries('leads');
      toast.success('New Facebook lead received!');
    });
    return () => {
      socket.off('facebook:message_received');
      socket.off('lead:created');
      socket.disconnect();
    };
  }, [selectedPsid, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const conversations = (inbox?.data || []).filter((c) => {
    const text = c.lastMessage?.content?.text || '';
    const id = c._id || '';
    const q = search.toLowerCase();
    return id.toLowerCase().includes(q) || text.toLowerCase().includes(q);
  });

  return (
    <div className="page-container animate-fade-in font-sans h-[calc(100vh-7rem)] flex flex-col">
      <div className="section-header shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-[#1877F2]" /> Messenger Inbox
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Facebook Page Messenger conversations synced via Meta webhook. New messages only (history import limited by Meta).
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetchInbox()}
          className="btn-secondary gap-1.5 text-xs h-8"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Inbox list */}
        <div className="md:col-span-1 bg-white border border-gray-100 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                className="input pl-9 text-xs h-9"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingInbox ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-medium">No Messenger chats yet</p>
                <p className="text-[10px] text-gray-300 mt-1 leading-relaxed">
                  Settings → Facebook Page webhook সেট করুন। পেজে নতুন মেসেজ এলে এখানে দেখাবে।
                </p>
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => setSelectedPsid(c._id)}
                  className={`w-full text-left px-3 py-3 border-b border-gray-50 hover:bg-slate-50 transition-colors ${
                    selectedPsid === c._id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-gray-800 truncate">
                        PSID {String(c._id).slice(-8)}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {c.lastMessage?.content?.text || `[${c.lastMessage?.type || 'message'}]`}
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-300 shrink-0">
                      {c.totalMessages}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Conversation */}
        <div className="md:col-span-2 bg-white border border-gray-100 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          {!selectedPsid ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageCircle className="h-10 w-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">Select a conversation</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-slate-50/80">
                <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs font-bold">
                  M
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">Messenger user</div>
                  <div className="text-[10px] text-gray-400 font-mono">{selectedPsid}</div>
                </div>
              </div>
              <div
                className="flex-1 overflow-y-auto p-4 space-y-2"
                style={{ background: 'linear-gradient(180deg, #f0f4f8 0%, #f8fafc 100%)' }}
              >
                {loadingConvo ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-16">No messages</p>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.direction === 'outbound';
                    return (
                      <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                            isOwn
                              ? 'bg-[#1877F2] text-white rounded-br-sm'
                              : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-xs leading-relaxed">
                            {msg.content?.text || `[${msg.type}]`}
                          </p>
                          <div className={`text-[9px] mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                            {msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

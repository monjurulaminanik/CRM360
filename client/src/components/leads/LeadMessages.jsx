import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Send, Phone, CheckCheck, Check, Clock, Loader2, MessageCircle, Smile } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { whatsappService } from '../../services/whatsappService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

function MessageStatusIcon({ status }) {
  if (status === 'read')      return <CheckCheck size={12} className="text-blue-400" />;
  if (status === 'delivered') return <CheckCheck size={12} className="text-gray-400" />;
  if (status === 'sent')      return <Check size={12} className="text-gray-400" />;
  return <Clock size={12} className="text-gray-300" />;
}

function dayLabel(date) {
  if (isToday(date))     return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'dd MMM yyyy');
}

function groupByDay(messages) {
  return messages.reduce((groups, msg) => {
    const d = dayLabel(new Date(msg.createdAt));
    if (!groups[d]) groups[d] = [];
    groups[d].push(msg);
    return groups;
  }, {});
}

function Bubble({ msg, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`relative max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isOwn
            ? 'bg-primary text-white rounded-br-sm'
            : 'bg-white text-dark border border-gray-100 rounded-bl-sm'
        }`}
      >
        {/* Sender name (inbound only, multi-agent scenario) */}
        {!isOwn && msg.sentBy?.name && (
          <div className="text-[10px] font-semibold text-primary mb-0.5">{msg.sentBy.name}</div>
        )}

        {/* Content */}
        {msg.type === 'text' ? (
          <p className="whitespace-pre-wrap">{msg.content?.text}</p>
        ) : msg.type === 'template' ? (
          <p className="italic text-xs opacity-75">Template: {msg.content?.templateName}</p>
        ) : (
          <p className="italic text-xs opacity-75">[{msg.type} message]</p>
        )}

        {/* Timestamp + status */}
        <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-white/60' : 'text-gray-400'}`}>
          <span className="text-[10px]">{format(new Date(msg.createdAt), 'h:mm a')}</span>
          {isOwn && <MessageStatusIcon status={msg.status} />}
        </div>
      </div>
    </div>
  );
}

export default function LeadMessages({ lead }) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const phone = lead?.phone;

  const { data, isLoading } = useQuery(
    ['whatsapp-conv', phone],
    () => whatsappService.getConversation(phone),
    { enabled: Boolean(phone), staleTime: 10_000 }
  );

  const messages = data?.data || [];

  // Real-time: socket.io
  useEffect(() => {
    if (!phone) return;
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket'],
    });

    socket.on('whatsapp:message_received', (msg) => {
      if (msg.conversationId === phone) {
        queryClient.setQueryData(['whatsapp-conv', phone], (old) => ({
          ...old,
          data: [...(old?.data || []), msg],
        }));
      }
    });

    socket.on('whatsapp:message_sent', (msg) => {
      if (msg.to === phone) {
        queryClient.setQueryData(['whatsapp-conv', phone], (old) => ({
          ...old,
          data: [...(old?.data || []), msg],
        }));
      }
    });

    return () => socket.disconnect();
  }, [phone, queryClient]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMutation = useMutation(
    (message) => whatsappService.sendMessage({ to: phone, message, leadId: lead._id }),
    {
      onSuccess: () => {
        setText('');
        inputRef.current?.focus();
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to send message'),
    }
  );

  const handleSend = () => {
    const msg = text.trim();
    if (!msg || !phone) return;
    sendMutation.mutate(msg);
  };

  if (!phone) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <Phone size={22} className="text-gray-300" />
        </div>
        <h3 className="text-sm font-semibold text-dark mb-1">No phone number</h3>
        <p className="text-xs text-gray-400 max-w-[240px]">
          Add a phone number to this lead to view and send WhatsApp messages.
        </p>
      </div>
    );
  }

  const grouped = groupByDay(messages);
  const days = Object.keys(grouped);

  return (
    <div className="flex flex-col" style={{ height: '520px' }}>
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100 rounded-t-xl shrink-0">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <MessageCircle size={14} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-dark">{lead.name}</div>
          <div className="text-[10px] text-gray-400">{phone}</div>
        </div>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin space-y-1"
        style={{ background: 'linear-gradient(180deg, #f0f4f8 0%, #f8fafc 100%)' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={20} className="animate-spin text-gray-300" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle size={28} className="text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">No messages yet</p>
            <p className="text-xs text-gray-300 mt-1">Start the conversation below</p>
          </div>
        ) : (
          days.map((day) => (
            <div key={day}>
              {/* Day label */}
              <div className="flex items-center gap-2 my-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[10px] text-gray-400 font-medium px-2">{day}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              {grouped[day].map((msg) => (
                <Bubble
                  key={msg._id}
                  msg={msg}
                  isOwn={msg.direction === 'outbound'}
                />
              ))}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 px-3 py-2.5 bg-white border-t border-gray-100 flex items-end gap-2">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors shrink-0">
          <Smile size={18} />
        </button>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 text-sm text-dark bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all scrollbar-thin"
          style={{ minHeight: '38px', maxHeight: '96px' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sendMutation.isLoading}
          className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white transition-all hover:bg-primary-dark active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {sendMutation.isLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}
        </button>
      </div>
    </div>
  );
}

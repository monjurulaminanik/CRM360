import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { whatsappService } from '../services/whatsappService';
import { leadService } from '../services/leadService';
import { clientService } from '../services/clientService';
import { useAuthStore } from '../store/authStore';
import { 
  Search, Send, Phone, User, Users, CheckCheck, Check, 
  FileText, Sparkles, Plus, Clock, ChevronRight, Info,
  MessageSquare, ShieldAlert, ArrowLeftRight, UserCheck,
  TrendingUp, Building2, Globe, Mail, MessageCircle, AlertCircle,
  ArrowLeft
} from 'lucide-react';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { autoConnect: false });

export default function WhatsAppPage() {
  const [searchParams] = useSearchParams();
  const [selectedPhone, setSelectedPhone] = useState(searchParams.get('phone') || '');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inboxSearch, setInboxSearch] = useState('');
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'contacts' | 'templates'
  const [contactSearch, setContactSearch] = useState('');
  
  // Mobile responsive views: 'list' (inbox/directory), 'chat' (active messaging screen), 'details' (contact metadata & notes drawer)
  const [mobileView, setMobileView] = useState(searchParams.get('phone') ? 'chat' : 'list');
  
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch active WhatsApp conversations (Inbox)
  const { data: inbox, isLoading: loadingInbox } = useQuery('whatsapp-inbox', whatsappService.getInbox, {
    refetchInterval: 10000,
  });

  // Fetch Leads & Clients for directory access
  const { data: leadsRes } = useQuery('leads-all', () => leadService.getAll({ limit: 100 }));
  const { data: clientsRes } = useQuery('clients-all', () => clientService.getAll({ limit: 100 }));

  const leads = leadsRes?.data || [];
  const clients = clientsRes?.data || [];

  // Match the currently selected phone with a Lead or Client details
  const matchedLead = leads.find(l => l.phone?.replace(/[+\s-]/g, '') === selectedPhone?.replace(/[+\s-]/g, ''));
  const matchedClient = clients.find(c => c.phone?.replace(/[+\s-]/g, '') === selectedPhone?.replace(/[+\s-]/g, '') || c.whatsappNumber?.replace(/[+\s-]/g, '') === selectedPhone?.replace(/[+\s-]/g, ''));
  
  const activeContact = matchedClient 
    ? { ...matchedClient, type: 'client' } 
    : matchedLead 
      ? { ...matchedLead, type: 'lead' } 
      : null;

  // Fetch Conversation History
  const { isLoading: loadingConvo } = useQuery(
    ['whatsapp-convo', selectedPhone],
    () => whatsappService.getConversation(selectedPhone),
    {
      enabled: !!selectedPhone,
      onSuccess: (data) => setMessages(data.data || []),
    }
  );

  // Send Message Mutation
  const sendMutation = useMutation(
    (msgText) => whatsappService.sendMessage({ 
      to: selectedPhone, 
      message: msgText,
      leadId: matchedLead?._id || null,
      clientId: matchedClient?._id || null
    }),
    {
      onSuccess: (res) => {
        setMessages((prev) => {
          if (prev.some(m => m.waMessageId === res.data.waMessageId)) return prev;
          return [...prev, res.data];
        });
        setMessage('');
        queryClient.invalidateQueries('whatsapp-inbox');
        
        // Trigger simulated typing & reply after outbound message
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
        }, 1800);
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to send'),
    }
  );

  // Send Template Mutation
  const templateMutation = useMutation(
    (templateName) => whatsappService.sendTemplate({
      to: selectedPhone,
      templateName,
      leadId: matchedLead?._id || null,
      clientId: matchedClient?._id || null
    }),
    {
      onSuccess: (res) => {
        setMessages((prev) => [...prev, res.data]);
        toast.success(`Template "${res.data.content.templateName}" sent!`);
        queryClient.invalidateQueries('whatsapp-inbox');
        
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
        }, 1800);
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to send template'),
    }
  );

  // Convert Lead to Client Mutation
  const convertMutation = useMutation(
    () => leadService.convert(matchedLead?._id, {}),
    {
      onSuccess: () => {
        toast.success('Lead converted to Client successfully!');
        queryClient.invalidateQueries('leads-all');
        queryClient.invalidateQueries('clients-all');
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Conversion failed'),
    }
  );

  // Quick note additions right inside the chat window!
  const [quickNote, setQuickNote] = useState('');
  const addNoteMutation = useMutation(
    () => {
      if (activeContact.type === 'lead') {
        return leadService.addNote(activeContact._id, { text: quickNote, type: 'whatsapp' });
      } else {
        return clientService.addNote(activeContact._id, { text: quickNote, type: 'whatsapp' });
      }
    },
    {
      onSuccess: () => {
        toast.success('Activity note logged!');
        setQuickNote('');
        queryClient.invalidateQueries('leads-all');
        queryClient.invalidateQueries('clients-all');
      },
      onError: () => toast.error('Failed to log note'),
    }
  );

  // Socket.io real-time connection
  useEffect(() => {
    socket.connect();
    
    socket.on('whatsapp:message_received', (msg) => {
      if (msg.from === selectedPhone || msg.conversationId === selectedPhone) {
        setMessages((prev) => {
          if (prev.some(m => m.waMessageId === msg.waMessageId)) return prev;
          return [...prev, msg];
        });
      }
      queryClient.invalidateQueries('whatsapp-inbox');
    });

    socket.on('whatsapp:message_sent', (msg) => {
      if (msg.to === selectedPhone || msg.conversationId === selectedPhone) {
        setMessages((prev) => {
          if (prev.some(m => m.waMessageId === msg.waMessageId)) return prev;
          return [...prev, msg];
        });
      }
      queryClient.invalidateQueries('whatsapp-inbox');
    });

    socket.on('whatsapp:status_update', (update) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.waMessageId === update.id ? { ...msg, status: update.status } : msg
        )
      );
    });

    return () => {
      socket.off('whatsapp:message_received');
      socket.off('whatsapp:message_sent');
      socket.off('whatsapp:status_update');
      socket.disconnect();
    };
  }, [selectedPhone]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedPhone) return;
    sendMutation.mutate(message);
  };

  // Filter inbox conversations
  const filteredInbox = inbox?.data?.filter(conv => 
    conv._id.toLowerCase().includes(inboxSearch.toLowerCase()) ||
    (conv.lastMessage?.content?.text || '').toLowerCase().includes(inboxSearch.toLowerCase())
  ) || [];

  // Directory contacts for tab view
  const allContacts = [
    ...leads.map(l => ({ ...l, type: 'lead' })),
    ...clients.map(c => ({ ...c, type: 'client' }))
  ].filter(c => 
    c.phone && 
    (c.name.toLowerCase().includes(contactSearch.toLowerCase()) || 
     c.phone.includes(contactSearch) || 
     (c.company || '').toLowerCase().includes(contactSearch.toLowerCase()))
  );

  // Premium Custom Pre-Made Quick Response Templates
  const customTemplates = [
    { name: 'onboarding_welcome', label: '🚀 Onboarding Welcome', body: 'Hi {{Name}}, welcome to Dawat IT! We are absolutely thrilled to partner with you. Let\'s make something extraordinary!' },
    { name: 'meeting_invite', label: '📅 Meeting invitation', body: 'Hi {{Name}}, hope you are well. We would love to schedule a quick sync to finalize the draft strategy. Let us know your availability!' },
    { name: 'proposal_followup', label: '🎯 Proposal Follow-up', body: 'Hi {{Name}}, just following up on the growth plan proposal we shared yesterday. We\'re happy to adjust the details to fit your targets.' },
    { name: 'payment_received', label: '💳 Payment Confirmation', body: 'Dear {{Name}}, thank you! We have successfully received your payment. Your receipt is now accessible in the Client Portal.' },
  ];

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4 animate-fade-in font-sans relative overflow-hidden">
      
      {/* ── LEFT SIDEBAR: SHARED INBOX & CONTACTS ── */}
      <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm flex-col overflow-hidden transition-all duration-200 ${
        mobileView === 'list' ? 'flex w-full h-full' : 'hidden md:flex md:w-80 md:h-auto'
      }`}>
        
        {/* Workspace Tab Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex gap-2 p-1 bg-gray-200/60 rounded-xl">
            <button 
              onClick={() => setActiveTab('chats')}
              className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'chats' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Inbox
            </button>
            <button 
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'contacts' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Directory
            </button>
            <button 
              onClick={() => setActiveTab('templates')}
              className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'templates' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Templates
            </button>
          </div>
        </div>

        {/* Dynamic List Container */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Active Chats Tab */}
          {activeTab === 'chats' && (
            <>
              {/* Inbox Search */}
              <div className="p-3 border-b border-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    className="input pl-9 text-xs"
                    placeholder="Search active chats..."
                    value={inboxSearch}
                    onChange={(e) => setInboxSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Chat Conversation Items */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
                {loadingInbox && (
                  <div className="p-6 text-center text-xs text-gray-400">Loading inbox...</div>
                )}
                
                {filteredInbox.map((conv) => {
                  const contactDetail = [
                    ...leads.map(l => ({ ...l, label: 'Lead' })),
                    ...clients.map(c => ({ ...c, label: 'Client' }))
                  ].find(c => c.phone?.replace(/[+\s-]/g, '') === conv._id?.replace(/[+\s-]/g, ''));

                  const isSelected = selectedPhone === conv._id;

                  return (
                    <button
                      key={conv._id}
                      onClick={() => {
                        setSelectedPhone(conv._id);
                        setMobileView('chat');
                      }}
                      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-all duration-200 border-l-4 ${
                        isSelected 
                          ? 'bg-primary-light/50 border-primary' 
                          : 'border-transparent hover:bg-gray-50'
                      }`}
                    >
                      {/* Avatar with initial or type logo */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        contactDetail?.label === 'Client' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {contactDetail?.name ? contactDetail.name.charAt(0) : 'WA'}
                      </div>

                      {/* Text content details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-semibold text-xs text-gray-800 truncate max-w-[120px]">
                            {contactDetail?.name || conv._id}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center gap-1.5">
                          <p className="text-xs text-gray-500 truncate flex-1">
                            {conv.lastMessage?.content?.text || (conv.lastMessage?.isTemplate ? '📄 Sent template' : '') || conv.lastMessage?.type}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-primary text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center flex-shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>

                        {/* Label Badge */}
                        {contactDetail && (
                          <span className={`inline-block text-[9px] font-semibold mt-1 px-1.5 py-0.5 rounded ${
                            contactDetail.label === 'Client' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                          }`}>
                            {contactDetail.label}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {!loadingInbox && !filteredInbox.length && (
                  <div className="p-8 text-center text-xs text-gray-400">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    No active chats found.
                  </div>
                )}
              </div>
            </>
          )}

          {/* Directory Tab */}
          {activeTab === 'contacts' && (
            <>
              {/* Directory search */}
              <div className="p-3 border-b border-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    className="input pl-9 text-xs"
                    placeholder="Search all leads & clients..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Directory list */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
                {allContacts.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => {
                      const cleanPhone = c.phone.replace(/[+\s-]/g, '');
                      setSelectedPhone(cleanPhone);
                      setActiveTab('chats');
                      setMobileView('chat');
                    }}
                    className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-all duration-150 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        c.type === 'client' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                      }`}>
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-gray-800 truncate">{c.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{c.company || 'Private Client'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                        c.type === 'client' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                      }`}>
                        {c.type}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
                    </div>
                  </button>
                ))}

                {!allContacts.length && (
                  <div className="p-8 text-center text-xs text-gray-400">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    No contacts found.
                  </div>
                )}
              </div>
            </>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs flex gap-2 border border-amber-100">
                <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>Click any quick template to load it. Select a chat first to send.</p>
              </div>

              {customTemplates.map((tpl) => (
                <button
                  key={tpl.name}
                  disabled={!selectedPhone}
                  onClick={() => templateMutation.mutate(tpl.name)}
                  className="w-full text-left p-3.5 bg-gray-50 hover:bg-primary-light/30 border border-gray-100 hover:border-primary/20 rounded-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50"
                >
                  <p className="font-semibold text-xs text-gray-800 mb-1 group-hover:text-primary transition-all duration-200">
                    {tpl.label}
                  </p>
                  <p className="text-[10px] text-gray-500 line-clamp-2">
                    {tpl.body}
                  </p>
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ── MAIN WORKSPACE: ACTIVE CHAT SCREEN ── */}
      <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm flex-col overflow-hidden transition-all duration-200 ${
        selectedPhone && mobileView === 'chat' ? 'flex w-full h-full' : 'hidden md:flex md:flex-1 md:h-auto'
      }`}>
        {selectedPhone ? (
          <>
            {/* Active Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/20">
              <div className="flex items-center gap-2.5 min-w-0">
                
                {/* Mobile Back Button */}
                <button 
                  onClick={() => setMobileView('list')}
                  className="block md:hidden p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 mr-0.5"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="w-9 h-9 bg-success/10 rounded-full flex items-center justify-center text-success font-bold text-xs flex-shrink-0">
                  {selectedPhone.slice(-2)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-800 text-xs truncate">{selectedPhone}</div>
                  <div className="flex items-center gap-1 text-[10px] text-success font-medium">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                    WhatsApp Active
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Mobile Details Toggle */}
                <button 
                  onClick={() => setMobileView('details')}
                  className="block md:hidden p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
                  title="View contact details"
                >
                  <Info className="h-4.5 w-4.5" />
                </button>

                <span className="hidden sm:inline-block text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                  Shared Inbox
                </span>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div 
              className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin relative transition-all duration-300"
              style={{
                backgroundColor: '#F8FAFC',
                backgroundImage: `
                  radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.02) 0%, transparent 40%),
                  radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.02) 0%, transparent 40%),
                  radial-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 100% 100%, 16px 16px'
              }}
            >
              {loadingConvo && (
                <div className="text-center text-xs text-gray-400 py-4">Loading conversation...</div>
              )}

              {messages.map((msg) => {
                const isOutbound = msg.direction === 'outbound';
                
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} items-end gap-2 animate-fade-in`}
                  >
                    {!isOutbound && (
                      <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs border border-primary/5">
                        {activeContact?.name ? activeContact.name.charAt(0) : 'U'}
                      </div>
                    )}
                    
                    <div className="flex flex-col max-w-[80%] md:max-w-[70%]">
                      <div
                        className={`px-4 py-2.5 text-xs shadow-xs border transition-all duration-200 ${
                          isOutbound
                            ? 'bg-gradient-to-br from-primary to-blue-600 text-white border-primary/10 rounded-2xl rounded-tr-[3px] shadow-sm shadow-primary/5'
                            : 'bg-white text-gray-850 border-slate-100 rounded-2xl rounded-tl-[3px]'
                        }`}
                      >
                        {/* Text / template payload */}
                        {msg.type === 'template' ? (
                          <div className="space-y-1.5">
                            <span className="flex items-center gap-1.5 text-[9px] font-bold bg-white/20 text-white px-2 py-0.5 rounded">
                              <FileText className="h-3 w-3" /> Template
                            </span>
                            <p className="font-semibold">{msg.content?.templateName}</p>
                            <p className="text-[10px] opacity-90">Delivered via WhatsApp API</p>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content?.text}</p>
                        )}
                        
                        {/* Status bar */}
                        <div className="flex justify-between items-center gap-4 mt-1.5 opacity-75">
                          <span className="text-[8px] tracking-wide">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                          
                          {isOutbound && (
                            <span className="text-[10px]">
                              {msg.status === 'read' ? (
                                <CheckCheck className="h-3.5 w-3.5 text-white inline" />
                              ) : msg.status === 'delivered' ? (
                                <CheckCheck className="h-3.5 w-3.5 text-white/70 inline" />
                              ) : (
                                <Check className="h-3.5 w-3.5 text-white/50 inline" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Outbound Employee Indicator */}
                      {isOutbound && msg.sentBy && (
                        <span className="text-[8px] text-gray-400 mt-1 self-end flex items-center gap-1 font-semibold uppercase tracking-wider">
                          <User className="h-2.5 w-2.5 text-gray-300" />
                          sent by: {typeof msg.sentBy === 'object' ? msg.sentBy.name : user?.name || 'Manager'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs border border-primary/5">
                    {activeContact?.name ? activeContact.name.charAt(0) : 'U'}
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2.5 text-xs text-gray-400 shadow-2xs flex items-center gap-1 rounded-tl-[3px]">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Interactive Floating Quick-Response Chips */}
            <div className="px-4 py-2.5 bg-white border-t border-gray-50 flex gap-2 overflow-x-auto scrollbar-thin shrink-0 select-none items-center">
              <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1 shrink-0 mr-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" /> Quick Templates:
              </span>
              {customTemplates.map((tpl) => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => {
                    const contactName = activeContact?.name?.split(' ')[0] || 'there';
                    const text = tpl.body.replace('{{Name}}', contactName);
                    setMessage(text);
                    toast.success('Template loaded into field!', { duration: 1500 });
                  }}
                  className="px-3 py-1.5 text-[10px] font-bold bg-slate-50 hover:bg-primary-light/50 border border-slate-150 rounded-xl text-slate-600 hover:text-primary transition-all duration-250 cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
                >
                  {tpl.label}
                </button>
              ))}
            </div>

            {/* Input Form Box */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2 bg-gray-50/30">
              <input
                className="input flex-1 text-xs"
                placeholder="Type your WhatsApp message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="submit"
                disabled={sendMutation.isLoading || !message.trim()}
                className="btn-primary px-4 disabled:opacity-60 text-xs gap-1.5 flex-shrink-0"
              >
                <Send className="h-3.5 w-3.5" /> Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50/20 relative">
            {/* High tech backdrop glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/3 blur-[120px]" />
              <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-success/3 blur-[120px]" />
            </div>
            
            <div className="text-center p-8 max-w-sm relative z-10 space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-light to-blue-100/50 text-primary border border-primary/10 rounded-3xl flex items-center justify-center text-2xl mx-auto shadow-sm animate-bounce duration-1000">
                💬
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-gray-800 tracking-tight">D360 Shared Inbox</h4>
                <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                  Choose an active chat from your Inbox or search through the directory to start a new chat with any client or lead!
                </p>
              </div>
              
              <div className="relative pt-2">
                <input
                  className="w-full text-center input text-xs rounded-xl border-slate-200 h-9"
                  placeholder="Or enter number manually (+88017...)"
                  value={selectedPhone}
                  onChange={(e) => setSelectedPhone(e.target.value.replace(/[+\s-]/g, ''))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT SIDEBAR: CURRENT CONTACT PROFILE VIEW ── */}
      {selectedPhone && activeContact && (
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm flex-col p-4 space-y-4 overflow-y-auto scrollbar-thin transition-all duration-200 ${
          mobileView === 'details' ? 'flex w-full h-full' : 'hidden md:flex md:w-80 md:h-auto'
        }`}>
          
          {/* Mobile Back to Chat Header */}
          <div className="flex md:hidden items-center gap-2 pb-2 border-b border-gray-100">
            <button 
              onClick={() => setMobileView('chat')}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold text-gray-700">Back to Chat</span>
          </div>

          {/* Section Header */}
          <div className="text-center pb-3 border-b border-gray-100">
            <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center font-bold text-xl mb-2 ${
              activeContact.type === 'client' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
            }`}>
              {activeContact.name.charAt(0)}
            </div>
            <h4 className="font-bold text-gray-800 text-xs truncate">{activeContact.name}</h4>
            <p className="text-[10px] text-gray-400">{activeContact.company || 'Personal Client'}</p>

            <span className={`inline-block text-[9px] font-bold mt-2 px-2 py-0.5 rounded-full ${
              activeContact.type === 'client' ? 'bg-success/15 text-success' : 'bg-primary/15 text-primary'
            }`}>
              {activeContact.type.toUpperCase()}
            </span>
          </div>

          {/* Details list */}
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Information</h5>
            
            <div className="space-y-2 text-xs">
              {activeContact.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <span>{activeContact.phone}</span>
                </div>
              )}
              {activeContact.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  <span className="truncate">{activeContact.email}</span>
                </div>
              )}
              {activeContact.company && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="h-3.5 w-3.5 text-gray-400" />
                  <span>{activeContact.company}</span>
                </div>
              )}
              {activeContact.website && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Globe className="h-3.5 w-3.5 text-gray-400" />
                  <a href={`http://${activeContact.website}`} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                    {activeContact.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Lead conversion drawer if current contact is a Lead */}
          {activeContact.type === 'lead' && (
            <div className="p-3 bg-primary-light/40 border border-primary/10 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-bold">Deal Conversion</span>
              </div>
              <p className="text-[10px] text-gray-600 leading-normal">
                Convert this lead to a paying Client. This will instantly grant them portal credentials.
              </p>
              <button
                onClick={() => convertMutation.mutate()}
                disabled={convertMutation.isLoading}
                className="w-full btn-primary h-8 text-[11px] font-semibold gap-1.5"
              >
                <UserCheck className="h-3.5 w-3.5" /> Convert to Client
              </button>
            </div>
          )}

          {/* Quick Notes logger */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Log WhatsApp Interaction Note</h5>
            <textarea
              className="w-full rounded-lg border border-gray-300 text-xs p-2 focus:ring-1 focus:ring-primary focus:outline-none resize-none"
              rows={3}
              placeholder="e.g., Client loved the design mockup, onboarding next week..."
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
            />
            <button
              onClick={() => addNoteMutation.mutate()}
              disabled={addNoteMutation.isLoading || !quickNote.trim()}
              className="w-full btn-secondary h-8 text-[11px] font-semibold flex items-center justify-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Log Note
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

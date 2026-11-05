import { Conversation } from "@/types/messages.type"

export const SAMPLE_CONVERSATIONS: Conversation[] = [
	{
		id: "conv-1",
		user: {
			name: "Angelo D.",
			avatar: "https://i.pravatar.cc/150?img=12",
			initials: "AD",
		},
		listing: {
			id: "principles-anatomy-physiology",
			title: "Principles of Anatomy and Physiology",
		},
		lastMessage: "Sounds good, see you there at the wooden tables...",
		time: "10:52 AM",
		unread: false,
	},
	{
		id: "conv-2",
		user: {
			name: "Sofia L.",
			initials: "SL",
		},
		listing: {
			id: "ceu-nursing-scrubs",
			title: "Official CEU Nursing Scrubs Set",
		},
		lastMessage: "Can we meet near Centennial Bldg?",
		time: "09:15 AM",
		unread: true,
	},
	{
		id: "conv-3",
		user: {
			name: "Mark D.",
			initials: "MD",
		},
		listing: {
			id: "casio-fx-991cw",
			title: "Casio fx-991CW ClassWiz",
		},
		lastMessage: "Thanks! The calculator works smoothly.",
		time: "Yesterday",
		unread: false,
	},
	{
		id: "conv-4",
		user: {
			name: "Camille M.",
			avatar: "https://i.pravatar.cc/150?img=47",
			initials: "CM",
		},
		listing: {
			id: "ceu-clinical-duty-uniform",
			title: "CEU Clinical Duty Uniform Set",
		},
		lastMessage: "Let me know when you're free at Gate 1.",
		time: "Oct 21",
		unread: false,
	},
	{
		id: "conv-5",
		user: {
			name: "Kevin S.",
			avatar: "https://i.pravatar.cc/150?img=33",
			initials: "KS",
		},
		listing: {
			id: "logitech-k380",
			title: "Logitech K380 Bluetooth Keyboard",
		},
		lastMessage: "Is ₱1,000 okay if I pick it up today?",
		time: "Oct 20",
		unread: true,
	},
	{
		id: "conv-6",
		user: {
			name: "Marian C.",
			initials: "MC",
		},
		listing: {
			id: "laboratory-gown",
			title: "CEU White Laboratory Gown",
		},
		lastMessage: "Yes, size small is still available.",
		time: "Oct 18",
		unread: false,
	},
	{
		id: "conv-7",
		user: {
			name: "Julia R.",
			initials: "JR",
		},
		listing: {
			id: "pnle-reviewer-notes",
			title: "PNLE Reviewer and Nursing Notes",
		},
		lastMessage: "Are there handwritten notes on the pages?",
		time: "Oct 14",
		unread: true,
	},
	{
		id: "conv-8",
		user: {
			name: "Luis P.",
			initials: "LP",
		},
		listing: {
			id: "wireless-mouse",
			title: "Logitech Wireless Mouse",
		},
		lastMessage: "The USB receiver is included. You can test it first.",
		time: "Oct 13",
		unread: false,
	},
	{
		id: "conv-9",
		user: {
			name: "Trisha A.",
			initials: "TA",
		},
		listing: {
			id: "laboratory-safety-goggles",
			title: "Laboratory Safety Goggles",
		},
		lastMessage: "I'll be at Science Hall after my afternoon class.",
		time: "Oct 12",
		unread: true,
	},
	{
		id: "conv-10",
		user: {
			name: "Diego M.",
			initials: "DM",
		},
		listing: {
			id: "architecture-model-materials",
			title: "Foam Boards and Model-Making Materials",
		},
		lastMessage: "Could you send the dimensions of the remaining boards?",
		time: "Oct 11",
		unread: false,
	},
	{
		id: "conv-11",
		user: {
			name: "Andrea F.",
			initials: "AF",
		},
		listing: {
			id: "homemade-brownies",
			title: "Homemade Chocolate Brownies",
		},
		lastMessage: "Do these contain nuts? I'm checking before buying.",
		time: "Oct 10",
		unread: true,
	},
	{
		id: "conv-12",
		user: {
			name: "Paolo G.",
			initials: "PG",
		},
		listing: {
			id: "adjustable-tablet-stand",
			title: "Adjustable Aluminum Tablet Stand",
		},
		lastMessage: "Yes, it fits a 10-inch tablet without any problems.",
		time: "Oct 9",
		unread: false,
	},
	{
		id: "conv-13",
		user: {
			name: "Nicole B.",
			initials: "NB",
		},
		listing: {
			id: "anatomy-flashcards",
			title: "Anatomy and Physiology Flashcards",
		},
		lastMessage: "Would the Library Lobby work for you tomorrow?",
		time: "Oct 8",
		unread: false,
	},
	{
		id: "conv-14",
		user: {
			name: "Rafael T.",
			initials: "RT",
		},
		listing: {
			id: "casio-fx-570es-plus",
			title: "Casio fx-570ES PLUS Scientific Calculator",
		},
		lastMessage: "Could I check the buttons and display when we meet?",
		time: "Oct 7",
		unread: true,
	},
	{
		id: "conv-15",
		user: {
			name: "Elena V.",
			initials: "EV",
		},
		listing: {
			id: "nursing-scrubs-navy-medium",
			title: "Navy Blue Nursing Scrubs — Medium",
		},
		lastMessage: "I added the measurements to the listing description.",
		time: "Oct 6",
		unread: false,
	},
	{
		id: "conv-16",
		user: {
			name: "Angelo D.",
			avatar: "https://i.pravatar.cc/150?img=12",
			initials: "AD",
		},
		listing: {
			id: "organic-chemistry-textbook",
			title: "Organic Chemistry Textbook",
		},
		lastMessage: "This book is also available if you still need it.",
		time: "Oct 5",
		unread: false,
	},
]

export const SAMPLE_CHAT = {
  id: "conv-11",
  currentUserId: "user-bea",
  listing: {
    id: "homemade-brownies",
		status: "Available",
		image: "https://i.pravatar.cc/150?img=12",
		slug: "homemade-chocoloate-brownies-homemade-brownies",
    title: "Homemade Chocolate Brownies",
    price: 80,
  },
  participants: [
    {
      id: "user-bea",
      name: "Bea R.",
      initials: "BR",
    },
    {
      id: "user-andrea",
      name: "Andrea F.",
      initials: "AF",
    },
  ],
  messages: [
    {
      id: "msg-1",
      senderId: "user-andrea",
      content: "Hi! Are the brownies still available?",
      time: "10:05 AM",
    },
    {
      id: "msg-2",
      senderId: "user-bea",
      content: "Hi Andrea! Yes, they're ₱80 for a box of four.",
      time: "10:06 AM",
    },
    {
      id: "msg-3",
      senderId: "user-andrea",
      content: "Nice! Do they have nuts?",
      time: "10:06 AM",
    },
    {
      id: "msg-4",
      senderId: "user-bea",
      content: "Yes, this batch has walnut pieces mixed in.",
      time: "10:07 AM",
    },
    {
      id: "msg-5",
      senderId: "user-andrea",
      content:
        "Sounds good! I'd like one box. Can we meet at the Canteen after class?",
      time: "10:07 AM",
    },
    {
      id: "msg-6",
      senderId: "user-bea",
      content: "Sure! I'll be there around 12:30 PM. Does that work?",
      time: "10:08 AM",
    },
    {
      id: "msg-7",
      senderId: "user-andrea",
      content: "Yes, perfect. Can I pay cash when we meet?",
      time: "10:08 AM",
    },
    {
      id: "msg-8",
      senderId: "user-bea",
      content:
        "Yes, cash is fine. I'll be near the entrance carrying a white tote bag.",
      time: "10:09 AM",
    },
    {
      id: "msg-9",
      senderId: "user-andrea",
      content: "Got it! I'll be wearing a blue hoodie. See you later!",
      time: "10:09 AM",
    },
    {
      id: "msg-10",
      senderId: "user-bea",
      content: "See you! Just message me when you arrive 😊",
      time: "10:10 AM",
    },
  ],
};

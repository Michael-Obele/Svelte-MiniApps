export const items = [
    {
        title: "Offline-First Architecture",
        description: "Complete rebuild focusing on offline capabilities and local-first data management.",
        className: "md:col-span-2",
        color: "from-blue-500/20 via-transparent",
        icon: "🌐"
    },
    {
        title: "Enhanced Performance",
        description: "Optimized load times and responsiveness through local data management.",
        className: "md:col-span-1",
        color: "from-purple-500/20 via-transparent",
        icon: "⚡"
    },
    {
        title: "Svelte 5 Migration",
        description: "Complete upgrade to Svelte 5 with modern features and optimizations.",
        className: "md:col-span-1",
        color: "from-green-500/20 via-transparent",
        icon: "🔄"
    },
    {
        title: "Local Data Persistence",
        description: "Robust local storage implementation with IndexedDB and background sync.",
        className: "md:col-span-1",
        color: "from-yellow-500/20 via-transparent",
        icon: "💾"
    },
    {
        title: "PWA Support",
        description: "Full Progressive Web App capabilities with offline support and installability.",
        className: "md:col-span-1",
        color: "from-red-500/20 via-transparent",
        icon: "📱"
    },
    {
        title: "Copy to Clipboard Utility",
        description: "Introduced a versatile copyToClipboard function to streamline text copying across the app.",
        className: "md:col-span-1",
        color: "from-teal-500/20 via-transparent",
        icon: "📋"
    }
];

export const timeline = [
    {
        date: "December 10, 2024",
        title: "Password Generator Reimplementation & Clipboard Utility",
        description: "Complete overhaul of password generator and enhanced clipboard functionality",
        items: [
            "Reimplemented password generator with modern UI components and enhanced features",
            "Added versatile copyToClipboard utility function with toast notifications",
            "Implemented dynamic password strength indicators and character options",
            "Integrated slider component for flexible password length control",
            "Refactored emoji and password generators to use the new clipboard utility"
        ],
        icon: "🔐",
        color: "from-violet-500 to-fuchsia-500"
    },
    {
        date: "December 4, 2024",
        title: "QR Code Generator Enhancement",
        description: "Major improvements to QR code generation and social links functionality",
        items: [
            "Added QR code display component for improved modularity",
            "Implemented social links database with comprehensive management",
            "Created API endpoints for social links handling",
            "Enhanced QR code generator with text and social links input"
        ],
        icon: "🔄",
        color: "from-blue-500 to-cyan-500"
    },
    {
        date: "December 1-3, 2024",
        title: "Currency Converter & Emoji Tools",
        description: "New features and improvements to existing apps",
        items: [
            "Enhanced currency conversion with caching and user-agent rotation",
            "Added advanced emoji transformation features",
            "Implemented emoji checker functionality",
            "Added pattern validation for currency amounts"
        ],
        icon: "💱",
        color: "from-orange-500 to-yellow-500"
    },
    {
        date: "November 29-30, 2024",
        title: "Core Infrastructure Updates",
        description: "Major backend and infrastructure improvements",
        items: [
            "Implemented English dictionary with caching",
            "Added health check endpoint",
            "Enhanced service worker functionality",
            "Switched from drizzle-orm to Prisma for better database management"
        ],
        icon: "⚙️",
        color: "from-green-500 to-lime-500"
    },
    {
        date: "November 24-27, 2024",
        title: "Authentication & UI Enhancement",
        description: "Major user experience and authentication improvements",
        items: [
            "Implemented user authentication system",
            "Added user profile components",
            "Created offline page component",
            "Enhanced navbar with user context"
        ],
        icon: "🔐",
        color: "from-yellow-500 to-amber-500"
    },
    {
        date: "November 23-24, 2024",
        title: "UI/UX Improvements",
        description: "Enhanced visual feedback and animations",
        items: [
            "Added new Lottie animations for improved UI feedback",
            "Implemented trending, repository, and hover animations",
            "Updated welcome message and about page layout",
            "Added alert component with description support"
        ],
        icon: "✨",
        color: "from-red-500 to-pink-500"
    }
];

export const updates = [
    {
        category: "Technical Updates",
        items: [
            "Implemented Service Workers for enhanced offline capabilities",
            "Added PWA support for better mobile experience",
            "Optimized asset caching and delivery",
            "Integrated IndexedDB for local data storage"
        ]
    },
    {
        category: "User Experience",
        items: [
            "Enhanced offline state indicators and notifications",
            "Improved loading states and feedback mechanisms",
            "Added visual sync status indicators",
            "Streamlined navigation and interactions"
        ]
    },
    {
        category: "New Features",
        items: [
            "Implemented copyToClipboard utility for improved text copying functionality."
        ]
    },
    {
        category: "Refactor",
        items: [
            "Refactored random-emoji-generator and random-password-generator to utilize the new copyToClipboard utility."
        ]
    }
];
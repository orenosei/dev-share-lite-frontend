# DevShareLite Frontend

DevShareLite is a knowledge sharing application for developers, built with Next.js and Tailwind CSS.

## 🚀 Features

- **Post Management**: Create, edit, delete and share posts with Markdown editor
- **User System**: Registration, login, profile management
- **Social Interaction**: Comment, like posts
- **Notifications**: Real-time notification system
- **Responsive Design**: Optimized for all devices
- **Dark/Light Mode**: Flexible theme switching

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.4
- **UI Framework**: React 19.1.0
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Icons**: Lucide React, React Icons
- **Markdown**: React MD Editor
- **Theme**: Next Themes
- **Date handling**: Date-fns
- **Routing**: React Router DOM

## 📋 System Requirements

- Node.js 18.0.0 or higher
- npm or yarn

## 🔧 Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd dev-share-lite-frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Run the application in development mode**
```bash
npm run dev
# or
yarn dev
```

4. **Open browser and navigate to**
```
http://localhost:3000
```

## 📝 Scripts

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## 📁 Project Structure

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── layout.jsx         # Root layout
│   ├── page.jsx           # Home page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── posts/             # Post management
│   ├── settings/          # User settings
│   └── user/              # User profile
├── components/             # Reusable components
│   └── ui/                # UI components (Radix UI + Tailwind)
├── contexts/              # React Contexts
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── services/              # API services
└── styles/                # CSS files
```

## 🎨 UI Components

The project uses a design system based on:
- **Radix UI**: Accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful & consistent icon pack
- **Class Variance Authority**: Type-safe component variants

## 🔌 API Integration

Frontend connects to backend through services:
- `authService`: User authentication
- `postsService`: Post management
- `userService`: User information management
- `statsService`: System statistics

## 🎯 Key Features

### 1. Authentication
- Account registration
- Login/Logout
- Session management

### 2. Posts Management
- Create posts with Markdown editor
- Edit posts
- Delete posts
- Like/Unlike posts

### 3. User Profile
- View personal information
- Edit profile
- Upload avatar

### 4. Comments
- Comment on posts
- Reply to comments
- Manage comments

### 5. Notifications
- Real-time notifications
- Mark as read

## 🌐 Environment Variables

Create a `.env.local` file and add the necessary environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository with Vercel
3. Set up environment variables
4. Auto deploy

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Project Link: [https://github.com/orenosei/dev-share-lite-frontend](https://github.com/orenosei/dev-share-lite-frontend)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide](https://lucide.dev/)

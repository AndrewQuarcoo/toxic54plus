# Hack54 - Performance Optimization Lab

A modern web application built with Next.js and TypeScript, featuring a landing page and authentication components based on the Figma design.

## Features

- **Landing Page**: Hero section with compelling copy and call-to-action buttons
- **Signup Authentication**: Complete signup form with social login options
- **Login Authentication**: Login form with remember me and forgot password functionality
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **Modern UI**: Dark theme with custom color palette matching the design

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Custom SVG icons for social login buttons
- **Font**: Inter font family

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hack54-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
hack54-app/
├── app/
│   ├── globals.css          # Global styles and Tailwind imports
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main page with view switching
├── components/
│   ├── LandingPage.tsx      # Landing page component
│   ├── SignupAuth.tsx       # Signup form component
│   └── LoginAuth.tsx        # Login form component
├── public/                  # Static assets
├── package.json
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── README.md
```

## Components

### LandingPage
- Hero section with main headline and CTA
- Features section highlighting key benefits
- Navigation bar with links
- Responsive design for all screen sizes

### SignupAuth
- Social login buttons (Google, Facebook)
- Form validation
- Terms and conditions checkbox
- Link to login page

### LoginAuth
- Social login buttons
- Remember me functionality
- Forgot password link
- Link to signup page

## Customization

### Colors
The color palette is defined in `tailwind.config.js`:
- `hack-bg`: Main background color (#0D0B0B)
- `hack-bg-light`: Light background (#100F0F)
- `hack-white`: Primary text color (#FFFFFF)
- `hack-blue`: Primary accent color (#3B82F6)
- `hack-gray`: Secondary text color (rgba(255, 255, 255, 0.6))

### Styling
All components use Tailwind CSS classes with custom color variables. The design closely follows the Figma specifications with:
- Dark theme throughout
- Rounded corners and subtle borders
- Hover effects and transitions
- Responsive grid layouts

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Components

1. Create new component files in the `components/` directory
2. Use TypeScript interfaces for props
3. Follow the existing naming conventions
4. Use Tailwind CSS for styling

## Deployment

The application can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Railway**

For Vercel deployment:
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

// // app/page.jsx
// 'use client'

// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';

// export default function Home() {
//   const [email, setEmail] = useState('');
//   const [visible, setVisible] = useState(false);
//   const [currentFeature, setCurrentFeature] = useState(0);

//   const features = [
//     'Keep 100% of Your Royalties',
//     'Unlimited Releases',
//     'Fast Distribution',
//     'Split Payments',
//     'Real-time Analytics',
//     'Cover Song Licensing'
//   ];

//   // Animation for section visibility
//   useEffect(() => {
//     setVisible(true);
//   }, []);

//   // Animation for rotating features
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentFeature((prev) => (prev + 1) % features.length);
//     }, 2000);
//     return () => clearInterval(interval);
//   }, [features.length]);

//   return (
//     <div className="flex flex-col min-h-screen bg-white">
//       {/* Navigation */}
//       <nav className="bg-white shadow-md sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16">
//             <div className="flex items-center">
//               <div className="text-2xl font-bold text-rose-600">SoundHex</div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <Link href="/pricing" className="text-gray-700 hover:text-rose-600 font-medium transition-colors duration-300">Pricing</Link>
//               <Link href="/features" className="text-gray-700 hover:text-rose-600 font-medium transition-colors duration-300">Features</Link>
//               <Link href="/help" className="text-gray-700 hover:text-rose-600 font-medium transition-colors duration-300">Help</Link>
//               <button className="text-rose-600 border border-rose-600 bg-white px-4 py-2 rounded-md font-medium hover:bg-rose-50 transition-colors duration-300">
//                 Log In
//               </button>
//               <button className="bg-rose-600 text-white px-4 py-2 rounded-md font-medium hover:bg-rose-700 transition-colors duration-300">
//                 Sign Up
//               </button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <div className="flex-grow">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
//           <div className="lg:flex items-center">
//             <div className="lg:w-1/2 mb-10 lg:mb-0">
//               <h1 
//                 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} transition-all duration-1000 ease-out`}
//               >
//                 Distribute Your Music <span className="text-rose-600">Worldwide</span>
//               </h1>
//               <p 
//                 className={`mt-6 text-xl text-gray-600 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} transition-all duration-1000 ease-out delay-300`}
//               >
//                 Upload once, distribute everywhere. Keep 100% of your royalties.
//               </p>
//               <div 
//                 className={`mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} transition-all duration-1000 ease-out delay-500`}
//               >
//                 <button className="bg-rose-600 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-rose-700 transition-all duration-300 hover:shadow-lg">
//                   Get Started
//                 </button>
//                 <button className="bg-white text-gray-800 border border-gray-300 font-bold px-8 py-4 rounded-lg text-lg hover:border-rose-600 hover:text-rose-600 transition-all duration-300">
//                   Learn More
//                 </button>
//               </div>
//               <div 
//                 className={`mt-12 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} transition-all duration-1000 ease-out delay-700`}
//               >
//                 <p className="text-gray-700 font-medium mb-4">Available on all major platforms:</p>
//                 <div className="flex flex-wrap gap-6">
//                   {['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'TikTok', 'Instagram'].map((platform) => (
//                     <div key={platform} className="bg-gray-100 px-4 py-2 rounded-md text-gray-700 hover:text-rose-600 hover:border-rose-600 hover:shadow-sm transition-all duration-300">
//                       {platform}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//             <div className="lg:w-1/2 lg:pl-12">
//               <div 
//                 className={`bg-white rounded-xl p-6 shadow-lg transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} transition-all duration-1000 ease-out delay-300 hover:shadow-xl transition-shadow duration-300`}
//               >
//                 <div className="text-center mb-6">
//                   <h2 className="text-2xl font-bold text-gray-800">Start distributing your music today</h2>
//                   <p className="text-gray-600 mt-2">Simple, fast, and affordable</p>
//                 </div>
//                 <div className="space-y-4">
//                   <div>
//                     <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
//                     <input
//                       type="email"
//                       id="email"
//                       className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 transition-all duration-300"
//                       placeholder="your@email.com"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                     />
//                   </div>
//                   <button className="w-full bg-rose-600 text-white px-4 py-3 rounded-md font-medium hover:bg-rose-700 transition-all duration-300 hover:shadow-md">
//                     Create Account
//                   </button>
//                   <p className="text-xs text-gray-500 text-center mt-2">
//                     By signing up, you agree to our Terms of Service and Privacy Policy
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Animated Feature Highlight */}
//         <div className="bg-gray-50 py-12">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-center">
//               <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Musicians Choose <span className="text-rose-600">SoundHex</span></h2>
//               <div className="h-20 flex items-center justify-center">
//                 {features.map((feature, index) => (
//                   <p 
//                     key={index}
//                     className={`text-xl md:text-2xl font-semibold transition-all duration-500 absolute ${
//                       index === currentFeature 
//                         ? 'opacity-100 transform-none' 
//                         : 'opacity-0 translate-y-8'
//                     }`}
//                   >
//                     {feature}
//                   </p>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Features Section */}
//         <div className="bg-white py-16">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-center mb-12">
//               <h2 className="text-3xl font-bold text-gray-900">Everything You <span className="text-rose-600">Need</span></h2>
//               <p className="mt-4 text-xl text-gray-600">The simplest way to get your music heard worldwide</p>
//             </div>
//             <div className="grid md:grid-cols-3 gap-8">
//               {[
//                 {
//                   title: 'Keep 100% of Your Royalties',
//                   description: 'No commission, no hidden fees. You keep everything you earn from your music.'
//                 },
//                 {
//                   title: 'Unlimited Releases',
//                   description: 'Upload as many songs and albums as you want. No extra charges for more music.'
//                 },
//                 {
//                   title: 'Fast Distribution',
//                   description: 'Get your music on all major platforms in just a few days.'
//                 },
//                 {
//                   title: 'Split Payments',
//                   description: 'Easily share earnings with collaborators, producers, and band members.'
//                 },
//                 {
//                   title: 'Real-time Analytics',
//                   description: 'Track your streams, downloads, and earnings across all platforms in one place.'
//                 },
//                 {
//                   title: 'Cover Song Licensing',
//                   description: 'We handle the paperwork for cover songs so you can focus on the music.'
//                 }
//               ].map((feature, index) => (
//                 <div 
//                   key={index} 
//                   className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:border-rose-300 group"
//                 >
//                   <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors duration-300">{feature.title}</h3>
//                   <p className="text-gray-600">{feature.description}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Pricing Section */}
//         <div className="bg-gray-50 py-16">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-center mb-12">
//               <h2 className="text-3xl font-bold text-gray-900">Simple, <span className="text-rose-600">Transparent</span> Pricing</h2>
//               <p className="mt-4 text-xl text-gray-600">No hidden fees, no surprises</p>
//             </div>
//             <div className="bg-white rounded-xl overflow-hidden shadow-xl max-w-2xl mx-auto border border-gray-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
//               <div className="bg-rose-600 p-6 text-center">
//                 <h3 className="text-2xl font-bold text-white">Annual Membership</h3>
//                 <div className="mt-4">
//                   <span className="text-5xl font-bold text-white">$19.99</span>
//                   <span className="text-white ml-2">/year</span>
//                 </div>
//               </div>
//               <div className="p-6">
//                 <ul className="space-y-4">
//                   {[
//                     'Unlimited music uploads',
//                     'Distribution to 150+ streaming platforms',
//                     'Keep 100% of your royalties',
//                     'Detailed analytics and reporting',
//                     'Cover song licensing',
//                     'Split payments with collaborators',
//                     'Customizable artist profile',
//                     '24/7 customer support'
//                   ].map((feature, index) => (
//                     <li key={index} className="flex items-center">
//                       <svg className="h-5 w-5 text-rose-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                       </svg>
//                       <span>{feature}</span>
//                     </li>
//                   ))}
//                 </ul>
//                 <button className="mt-8 w-full bg-rose-600 text-white px-4 py-3 rounded-md font-medium hover:bg-rose-700 transition-all duration-300 hover:shadow-md">
//                   Get Started Now
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Testimonials */}
//         <div className="bg-white py-16">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-center mb-12">
//               <h2 className="text-3xl font-bold text-gray-900">What Our <span className="text-rose-600">Artists</span> Say</h2>
//               <p className="mt-4 text-xl text-gray-600">Join thousands of independent artists worldwide</p>
//             </div>
//             <div className="grid md:grid-cols-3 gap-8">
//               {[
//                 {
//                   name: 'Alex Rivera',
//                   role: 'Independent Artist',
//                   quote: 'SoundHex made it incredibly easy to get my music on all major platforms. The analytics help me understand where my listeners are coming from.'
//                 },
//                 {
//                   name: 'Sarah Chen',
//                   role: 'Singer-Songwriter',
//                   quote: 'I love that I keep 100% of my royalties. The platform is intuitive and the support team is always ready to help.'
//                 },
//                 {
//                   name: 'Marcus Johnson',
//                   role: 'Producer',
//                   quote: 'The split payment feature is a game-changer for collaborations. SoundHex has simplified my entire distribution process.'
//                 }
//               ].map((testimonial, index) => (
//                 <div 
//                   key={index} 
//                   className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-rose-300 group"
//                 >
//                   <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
//                   <div>
//                     <p className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors duration-300">{testimonial.name}</p>
//                     <p className="text-gray-500">{testimonial.role}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* CTA Section */}
//         <div className="bg-gray-50 py-16">
//           <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//             <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Share Your <span className="text-rose-600">Music</span> with the World?</h2>
//             <p className="text-xl text-gray-600 mb-8">Join thousands of artists who trust SoundHex with their music distribution</p>
//             <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
//               <button className="bg-rose-600 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-rose-700 transition-all duration-300 hover:shadow-lg transform hover:scale-105">
//                 Sign Up Now
//               </button>
//               <button className="bg-white border border-gray-300 text-gray-800 font-bold px-8 py-4 rounded-lg text-lg hover:text-rose-600 hover:border-rose-600 transition-all duration-300">
//                 Learn More
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <footer className="bg-gray-100 text-gray-800">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//           <div className="grid md:grid-cols-4 gap-8">
//             <div>
//               <h3 className="text-xl font-bold mb-4 text-rose-600">SoundHex</h3>
//               <p className="text-gray-600">The easiest way for independent artists to distribute their music worldwide.</p>
//             </div>
//             <div>
//               <h4 className="font-bold mb-4">Company</h4>
//               <ul className="space-y-2">
//                 {['About Us', 'Careers', 'Press', 'Contact'].map((item) => (
//                   <li key={item}>
//                     <Link href="#" className="text-gray-600 hover:text-rose-600 transition-colors duration-300">
//                       {item}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-bold mb-4">Resources</h4>
//               <ul className="space-y-2">
//                 {['Help Center', 'Blog', 'Artist Guides', 'FAQs'].map((item) => (
//                   <li key={item}>
//                     <Link href="#" className="text-gray-600 hover:text-rose-600 transition-colors duration-300">
//                       {item}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-bold mb-4">Legal</h4>
//               <ul className="space-y-2">
//                 {['Terms of Service', 'Privacy Policy', 'Copyright Policy', 'Royalty Policy'].map((item) => (
//                   <li key={item}>
//                     <Link href="#" className="text-gray-600 hover:text-rose-600 transition-colors duration-300">
//                       {item}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//           <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
//             <p className="text-gray-600">© 2025 SoundHex. All rights reserved.</p>
//             <div className="flex space-x-6 mt-4 md:mt-0">
//               {['Facebook', 'Twitter', 'Instagram', 'YouTube'].map((social) => (
//                 <Link key={social} href="#" className="text-gray-600 hover:text-rose-600 transition-colors duration-300">
//                   {social}
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }


// app/page.jsx
'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [visible, setVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    'Keep 100% of Your Royalties',
    'Unlimited Releases',
    'Fast Distribution',
    'Split Payments',
    'Real-time Analytics',
    'Cover Song Licensing'
  ];

  // Animation for section visibility
  useEffect(() => {
    setVisible(true);
  }, []);

  // Animation for rotating features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Image 
                src="/images/soundhex.png" 
                width={48} 
                height={48} 
                alt="SoundHex Logo" 
                className="mr-2"
              />
              <div className="text-2xl font-bold text-rose-600">SoundHex</div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/pricing" className="text-gray-700 hover:text-rose-600 font-medium transition-colors duration-300">Pricing</Link>
              <Link href="/features" className="text-gray-700 hover:text-rose-600 font-medium transition-colors duration-300">Features</Link>
              <Link href="/help" className="text-gray-700 hover:text-rose-600 font-medium transition-colors duration-300">Help</Link>
              <button 
                onClick={() => router.push('/login')}
                className="text-rose-600 border border-rose-600 bg-white px-4 py-2 rounded-md font-medium hover:bg-rose-50 transition-colors duration-300"
              >
                Log In
              </button>
              <button 
                onClick={() => router.push('/register')}
                className="bg-rose-600 text-white px-4 py-2 rounded-md font-medium hover:bg-rose-700 transition-colors duration-300"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="lg:flex items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 
                className={`text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} transition-all duration-1000 ease-out`}
              >
                Distribute Your Music <span className="text-rose-600">Worldwide</span>
              </h1>
              <p 
                className={`mt-6 text-xl text-gray-600 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} transition-all duration-1000 ease-out delay-300`}
              >
                Upload once, distribute everywhere. Keep 100% of your royalties.
              </p>
              <div 
                className={`mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} transition-all duration-1000 ease-out delay-500`}
              >
                <button className="bg-rose-600 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-rose-700 transition-all duration-300 hover:shadow-lg">
                  Get Started
                </button>
                <button className="bg-white text-gray-800 border border-gray-300 font-bold px-8 py-4 rounded-lg text-lg hover:border-rose-600 hover:text-rose-600 transition-all duration-300">
                  Learn More
                </button>
              </div>
              <div 
                className={`mt-12 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} transition-all duration-1000 ease-out delay-700`}
              >
                <p className="text-gray-700 font-medium mb-4">Available on all major platforms:</p>
                <div className="flex flex-wrap gap-6">
                  {['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'TikTok', 'Instagram'].map((platform) => (
                    <div key={platform} className="bg-gray-100 px-4 py-2 rounded-md text-gray-700 hover:text-rose-600 hover:border-rose-600 hover:shadow-sm transition-all duration-300">
                      {platform}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 lg:pl-12">
              <div 
                className={`bg-white rounded-xl p-6 shadow-lg transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} transition-all duration-1000 ease-out delay-300 hover:shadow-xl transition-shadow duration-300`}
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Start distributing your music today</h2>
                  <p className="text-gray-600 mt-2">Simple, fast, and affordable</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 transition-all duration-300"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button className="w-full bg-rose-600 text-white px-4 py-3 rounded-md font-medium hover:bg-rose-700 transition-all duration-300 hover:shadow-md">
                    Create Account
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Feature Highlight */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Musicians Choose <span className="text-rose-600">SoundHex</span></h2>
              <div className="h-20 flex items-center justify-center">
                {features.map((feature, index) => (
                  <p 
                    key={index}
                    className={`text-xl md:text-2xl font-semibold transition-all duration-500 absolute ${
                      index === currentFeature 
                        ? 'opacity-100 transform-none' 
                        : 'opacity-0 translate-y-8'
                    }`}
                  >
                    {feature}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Everything You <span className="text-rose-600">Need</span></h2>
              <p className="mt-4 text-xl text-gray-600">The simplest way to get your music heard worldwide</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Keep 100% of Your Royalties',
                  description: 'No commission, no hidden fees. You keep everything you earn from your music.'
                },
                {
                  title: 'Unlimited Releases',
                  description: 'Upload as many songs and albums as you want. No extra charges for more music.'
                },
                {
                  title: 'Fast Distribution',
                  description: 'Get your music on all major platforms in just a few days.'
                },
                {
                  title: 'Split Payments',
                  description: 'Easily share earnings with collaborators, producers, and band members.'
                },
                {
                  title: 'Real-time Analytics',
                  description: 'Track your streams, downloads, and earnings across all platforms in one place.'
                },
                {
                  title: 'Cover Song Licensing',
                  description: 'We handle the paperwork for cover songs so you can focus on the music.'
                }
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:border-rose-300 group"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Simple, <span className="text-rose-600">Transparent</span> Pricing</h2>
              <p className="mt-4 text-xl text-gray-600">No hidden fees, no surprises</p>
            </div>
            <div className="bg-white rounded-xl overflow-hidden shadow-xl max-w-2xl mx-auto border border-gray-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="bg-rose-600 p-6 text-center">
                <h3 className="text-2xl font-bold text-white">Annual Membership</h3>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-white">$19.99</span>
                  <span className="text-white ml-2">/year</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {[
                    'Unlimited music uploads',
                    'Distribution to 150+ streaming platforms',
                    'Keep 100% of your royalties',
                    'Detailed analytics and reporting',
                    'Cover song licensing',
                    'Split payments with collaborators',
                    'Customizable artist profile',
                    '24/7 customer support'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-5 w-5 text-rose-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-8 w-full bg-rose-600 text-white px-4 py-3 rounded-md font-medium hover:bg-rose-700 transition-all duration-300 hover:shadow-md">
                  Get Started Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">What Our <span className="text-rose-600">Artists</span> Say</h2>
              <p className="mt-4 text-xl text-gray-600">Join thousands of independent artists worldwide</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Alex Rivera',
                  role: 'Independent Artist',
                  quote: 'SoundHex made it incredibly easy to get my music on all major platforms. The analytics help me understand where my listeners are coming from.'
                },
                {
                  name: 'Sarah Chen',
                  role: 'Singer-Songwriter',
                  quote: 'I love that I keep 100% of my royalties. The platform is intuitive and the support team is always ready to help.'
                },
                {
                  name: 'Marcus Johnson',
                  role: 'Producer',
                  quote: 'The split payment feature is a game-changer for collaborations. SoundHex has simplified my entire distribution process.'
                }
              ].map((testimonial, index) => (
                <div 
                  key={index} 
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-rose-300 group"
                >
                  <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors duration-300">{testimonial.name}</p>
                    <p className="text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Share Your <span className="text-rose-600">Music</span> with the World?</h2>
            <p className="text-xl text-gray-600 mb-8">Join thousands of artists who trust SoundHex with their music distribution</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-rose-600 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-rose-700 transition-all duration-300 hover:shadow-lg transform hover:scale-105">
                Sign Up Now
              </button>
              <button className="bg-white border border-gray-300 text-gray-800 font-bold px-8 py-4 rounded-lg text-lg hover:text-rose-600 hover:border-rose-600 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-rose-600">SoundHex</h3>
              <p className="text-gray-600">The easiest way for independent artists to distribute their music worldwide.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                {['About Us', 'Careers', 'Press', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-600 hover:text-rose-600 transition-colors duration-300">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                {['Help Center', 'Blog', 'Artist Guides', 'FAQs'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-600 hover:text-rose-600 transition-colors duration-300">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                {['Terms of Service', 'Privacy Policy', 'Copyright Policy', 'Royalty Policy'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-600 hover:text-rose-600 transition-colors duration-300">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600">© 2025 SoundHex. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {['Facebook', 'Twitter', 'Instagram', 'YouTube'].map((social) => (
                <Link key={social} href="#" className="text-gray-600 hover:text-rose-600 transition-colors duration-300">
                  {social}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
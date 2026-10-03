import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiShield, 
  FiCpu, 
  FiCheckCircle, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiAlertTriangle,
  FiHelpCircle,
  FiChevronDown,
  FiChevronUp,
  FiLock
} from 'react-icons/fi';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: "Is my vote really anonymous?",
      a: "Yes. Our system uses secure cryptographic SHA-256 hashing. The connection between your voter identity and the ballot is hashed and decoupled immediately after verifying that you haven't voted yet. Your actual choice remains secret forever."
    },
    {
      q: "How does the registration approval work?",
      a: "To ensure system integrity, administrators review every new registration's credentials (like Voter ID). You will be allowed to vote once an administrator validates your profile information and approves your account."
    },
    {
      q: "Can I edit or change my vote once cast?",
      a: "No. Once a vote is securely submitted, it is write-locked and hashed directly inside the database. It cannot be altered, deleted, or recast by anyone, including system administrators."
    },
    {
      q: "What measures prevent duplicate voting?",
      a: "Our backend uses database-level compound unique indexes combined with voter-to-election cryptographic checks to guarantee that each registered voter can only submit exactly one vote per election."
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <header className="relative py-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden w-full">
        <div className="flex-1 space-y-6 animate-slide-up">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-100/75 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 text-xs font-semibold">
            <FiShield className="w-4 h-4" />
            <span>Next-Generation Secure Voting Protocols Enabled</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
            Secure, Anonymous & <br />
            <span className="text-brand-600 dark:text-brand-400 bg-clip-text">Immutable E-Voting</span>
          </h1>
          
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl">
            Cast your vote securely from any device. Empowering modern organizations, institutions, and communities with cryptographic security, live results dashboard analytics, and absolute anonymity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              to="/register"
              className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl text-center shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 transition-all text-sm"
            >
              Get Registered Today
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium rounded-xl text-center border border-slate-200 dark:border-slate-800 shadow-sm transition-all text-sm"
            >
              Access Voting Portal
            </Link>
          </div>
        </div>

        <div className="flex-1 w-full flex justify-center lg:justify-end animate-fade-in">
          <div className="relative w-full max-w-md p-8 rounded-3xl glass-card shadow-2xl space-y-6">
            <div className="absolute top-4 right-4 bg-green-500/10 text-green-500 p-2 rounded-full">
              <FiCheckCircle className="w-5 h-5" />
            </div>
            
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Live System Integrity</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Ballot Security Shield</h3>
            </div>

            <div className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                <FiLock className="text-brand-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">End-to-End Encryption</p>
                  <p className="text-xs">All votes are written anonymously using one-way SHA-256 secure hash functions.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                <FiCpu className="text-brand-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">Role-Based Authorizations</p>
                  <p className="text-xs">Rigorous verification process requires administrators to confirm voter credentials.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="bg-slate-100/50 dark:bg-slate-900/30 py-20 px-6 w-full">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">System Security Highlights</h2>
            <p className="text-slate-500 dark:text-slate-400">Our platform is designed from the ground up to protect voter privacy and prevent fraudulent activities.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl glass-card shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <FiLock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Write-Once Ledger</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Votes are permanently written and cannot be changed or edited under any circumstances, preserving full election records.</p>
            </div>

            <div className="p-6 rounded-2xl glass-card shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <FiShield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Absolute Ballot Secrecy</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Cryptographically disconnects your voter identity profile from your cast ballot, ensuring your selection is 100% private.</p>
            </div>

            <div className="p-6 rounded-2xl glass-card shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <FiAlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Intrusion Protection</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Equipped with Express rate limiting, Helmet headers, XSS filters, and MongoDB injection sanitizers to withstand cyber attacks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-slate-500 dark:text-slate-400">Have questions about security, process, or results? Find answers below.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="rounded-2xl glass-card overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-4 flex items-center justify-between font-bold text-left text-slate-800 dark:text-white"
              >
                <span>{faq.q}</span>
                {activeFaq === index ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              {activeFaq === index && (
                <div className="px-6 pb-5 pt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-900/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-slate-100/50 dark:bg-slate-900/30 py-20 px-6 w-full">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Get in Touch</h2>
            <p className="text-slate-500 dark:text-slate-400">Need help setting up an election for your company, organization, or university? Contact our security support engineering team.</p>
            
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center space-x-3">
                <FiMail className="text-brand-600 dark:text-brand-400 w-5 h-5" />
                <span>support@securevote.internal</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiPhone className="text-brand-600 dark:text-brand-400 w-5 h-5" />
                <span>+1 (555) 019-2834</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiMapPin className="text-brand-600 dark:text-brand-400 w-5 h-5" />
                <span>Security Lab District, Suite 101, San Francisco, CA</span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl glass-card shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Send Message</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Full Name</label>
                <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Email Address</label>
                <input type="email" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder="name@domain.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Message</label>
                <textarea rows="4" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder="How can we help you?"></textarea>
              </div>
              <button type="submit" className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium shadow-lg shadow-brand-500/10 transition-all text-sm">
                Submit Support Request
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
          <p>© 2026 SecureVote. All rights reserved. Encrypted ballot operations strictly audited.</p>
          <div className="flex space-x-4">
            <Link to="#" className="hover:text-brand-500">Privacy Policy</Link>
            <Link to="#" className="hover:text-brand-500">Security Audits</Link>
            <Link to="#" className="hover:text-brand-500">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

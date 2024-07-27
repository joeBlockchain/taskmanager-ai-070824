// app/privacy-policy/page.tsx
import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <h2 className="text-2xl font-semibold mt-6 mb-4">
        Privacy Policy for TaskManager-AI
      </h2>

      <p className="mb-4">Last updated: [Date]</p>

      <h3 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h3>

      <p className="mb-4">
        TaskManager-AI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;)
        operates a kanban-style task manager system. This Privacy Policy
        explains how we collect, use, disclose, and safeguard your information
        when you use our service.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">
        2. Information We Collect
      </h3>

      <p className="mb-2">We collect information when you:</p>

      <ul className="list-disc pl-6 mb-4">
        <li>Sign in with Google or GitHub</li>
        <li>Create and manage projects, columns, tasks, and deliverables</li>
        <li>Use our service</li>
      </ul>

      <p className="mb-2">The information we collect includes:</p>

      <ul className="list-disc pl-6 mb-4">
        <li>User identification information from Google or GitHub</li>
        <li>Project details (name, description, creation date, etc.)</li>
        <li>Task and deliverable information</li>
        <li>Usage data and analytics</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-3">
        3. How We Use Your Information
      </h3>

      <p className="mb-2">We use your information to:</p>

      <ul className="list-disc pl-6 mb-4">
        <li>Provide and maintain our service</li>
        <li>Improve and personalize user experience</li>
        <li>Analyze usage of our service</li>
        <li>Communicate with you about our service</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-3">
        4. Data Storage and Security
      </h3>

      <p className="mb-4">
        We use Supabase to store your data. We implement security measures to
        maintain the safety of your personal information.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">
        5. Third-Party Services
      </h3>

      <p className="mb-4">
        We use Google and GitHub for authentication. Please review their privacy
        policies for more information on their data practices.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">6. Your Data Rights</h3>

      <p className="mb-4">
        You have the right to access, update, or delete your information.
        Contact us for assistance.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">
        7. Changes to This Privacy Policy
      </h3>

      <p className="mb-4">
        We may update our Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">8. Contact Us</h3>

      <p className="mb-4">
        If you have any questions about this Privacy Policy, please contact us.
      </p>
    </div>
  );
}

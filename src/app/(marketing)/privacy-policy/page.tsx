// app/privacy-policy/page.tsx
import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="prose prose-lg ml-8 mt-10">
      <h1 className="">Privacy Policy</h1>
      <h2 className="">Privacy Policy for TaskManager-AI</h2>

      <p className="">Last updated: July, 27, 2024</p>

      <h3 className="">1. Introduction</h3>

      <p className="">
        TaskManager-AI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;)
        operates a kanban-style task manager system. This Privacy Policy
        explains how we collect, use, disclose, and safeguard your information
        when you use our service.
      </p>

      <h3 className="">2. Information We Collect</h3>

      <p className="">We collect information when you:</p>

      <ul className="">
        <li>Sign in with Google or GitHub</li>
        <li>Create and manage projects, columns, tasks, and deliverables</li>
        <li>Use our service</li>
      </ul>

      <p className="">The information we collect includes:</p>

      <ul className="   ">
        <li>User identification information from Google or GitHub</li>
        <li>Project details (name, description, creation date, etc.)</li>
        <li>Task and deliverable information</li>
        <li>Usage data and analytics</li>
      </ul>

      <h3 className="">3. How We Use Your Information</h3>

      <p className="">We use your information to:</p>

      <ul className="">
        <li>Provide and maintain our service</li>
        <li>Improve and personalize user experience</li>
        <li>Analyze usage of our service</li>
        <li>Communicate with you about our service</li>
      </ul>

      <h3 className="">4. Data Storage and Security</h3>

      <p className="">
        We use Supabase to store your data. We implement security measures to
        maintain the safety of your personal information.
      </p>

      <h3 className="">5. Third-Party Services</h3>

      <p className="">
        We use Google and GitHub for authentication. Please review their privacy
        policies for more information on their data practices.
      </p>

      <h3 className="">6. Your Data Rights</h3>

      <p className="">
        You have the right to access, update, or delete your information.
        Contact us for assistance.
      </p>

      <h3 className="">7. Changes to This Privacy Policy</h3>

      <p className="">
        We may update our Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page.
      </p>

      <h3 className="">8. Contact Us</h3>

      <p className="">
        If you have any questions about this Privacy Policy, please contact us.
      </p>
    </div>
  );
}

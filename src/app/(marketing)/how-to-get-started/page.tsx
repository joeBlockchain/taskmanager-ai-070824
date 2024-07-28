import Image from "next/image";
import Link from "next/link";

import createProject from "../../../../public/create-project.gif";
import createTask from "../../../../public/create-task.gif";
import createDeliverable from "../../../../public/create-deliverable.gif";
import createContent from "../../../../public/create-content.gif";
import aiCreateProject from "../../../../public/ai-create-project.gif";
import aiCreateDeliverable from "../../../../public/ai-create-deliverable.gif";

export default function Component() {
  return (
    <div className="w-full">
      <header className="py-12 md:py-16 lg:py-20 border-b border-border">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              How to Get Started with TaskManager-AI
            </h1>
            <p className="text-muted-foreground md:text-xl/relaxed">
              Your comprehensive guide to mastering AI-powered project
              management and boosting productivity
            </p>
          </div>
        </div>
      </header>
      <div className="container grid gap-12 px-4 py-12 md:grid-cols-[300px_1fr] md:gap-16 md:py-16 lg:py-20">
        <nav className="sticky-none md:sticky top-20 space-y-4 self-start">
          <h2 className="text-lg font-semibold p-4 bg-secondary/80 rounded-lg">
            IN THIS GUIDE
          </h2>
          <ul className="space-y-4 ml-4">
            {[
              {
                href: "#introduction",
                text: "Welcome to TaskManager-AI",
              },
              {
                href: "#getting-started",
                text: "Getting Started: Your First Project",
              },
              { href: "#task-management", text: "Task Management Overview" },
              {
                href: "#deliverables",
                text: "Deliverables: Where the Magic Happens",
              },
              {
                href: "#content-management",
                text: "Content: Integrated Content Management",
              },
              {
                href: "#ai-superpowers",
                text: "AI Superpowers: Your New Digital Assistant",
                subItems: [
                  {
                    href: "#chat-interface",
                    text: "The All-Powerful Chat Interface",
                  },
                  { href: "#i-want-to", text: "The 'I Want To...' Feature" },
                ],
              },
              {
                href: "#ai-assisted-completion",
                text: "AI-Assisted Deliverable Completion",
              },
              {
                href: "#conclusion",
                text: "Conclusion: Your Productivity Journey Begins",
              },
            ].map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className="text-xl font-medium hover:underline toc-link"
                >
                  {item.text}
                </Link>
                {item.subItems && (
                  <ul className="ml-4 mt-2 space-y-2">
                    {item.subItems.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          href={subItem.href}
                          className="text-lg font-medium hover:underline toc-link"
                        >
                          {subItem.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="prose prose-2xl max-w-3xl" id="content">
          <section id="introduction" className="scroll-mt-20">
            <h1 className="scroll-mt-20">Welcome to TaskManager-AI</h1>
            <p>
              Welcome, productivity enthusiasts and procrastination conquerors!
              You&#39;ve just stumbled upon <strong>TaskManager-AI</strong>, the
              Swiss Army knife of project management (but with fewer pointy bits
              and more artificial intelligence).
            </p>
            <p>
              Imagine a world where your to-do lists actually get done, your
              team collaborates seamlessly, and your projects practically manage
              themselves. Well, we can&#39;t promise miracles, but
              TaskManager-AI comes pretty darn close!
            </p>
            <p>
              At its core, TaskManager-AI is a Kanban-style project management
              system that&#39;s been turbocharged with AI capabilities. It&#39;s
              designed to help you organize your work, track your progress, and
              boost your productivity – all while keeping your sanity intact.
              Think of it as your very own digital project manager, minus the
              coffee addiction and stern looks.
            </p>
            <p>
              But wait, there&#39;s more! TaskManager-AI isn&#39;t just another
              run-of-the-mill productivity tool that&#39;ll gather digital dust
              in the far corners of your browser. Our AI-powered features are
              here to revolutionize the way you work. Imagine having a tireless
              assistant who can help you create projects, manage tasks, and even
              draft content for your deliverables. It&#39;s like having a team
              of interns, but they actually know what they&#39;re doing!
            </p>
            <p>
              So, buckle up, future productivity ninja! In this guide, we&#39;ll
              walk you through the basics of TaskManager-AI, from creating your
              first project to unleashing the full power of our AI assistants.
              We promise to keep things light, fun, and mercifully free of
              corporate jargon. (Although we can&#39;t promise we won&#39;t slip
              in a dad joke or two – our AI seems to have developed a fondness
              for them.)
            </p>
            <p>
              Ready to embark on this exciting journey into the world of
              AI-assisted project management? Great! Just remember: with great
              power comes great responsibility... and hopefully, fewer missed
              deadlines and panic-induced pizza orders at 2 AM. Let&#39;s dive
              in!
            </p>
          </section>
          <section id="getting-started" className="scroll-mt-20">
            <h2>Getting Started: Your First Project</h2>
            <p>
              It&#39;s time to roll up your sleeves and dive into the wonderful
              world of TaskManager-AI. Creating your first project is like
              planting a seed in your productivity garden – except this seed
              grows faster than Jack&#39;s beanstalk on steroids!
            </p>
            <h3 id="step-1-navigate-to-project-creation">
              Step 1: Navigate to Project Creation
            </h3>
            <p>
              First things first, look for the{" "}
              <strong>&#39;New Project&#39;</strong> button. It&#39;s usually
              hanging out in the top corner of your dashboard, looking all shiny
              and inviting. Go ahead, give it a click. Don&apos;t worry; it
              doesn&apos;t bite!
            </p>
            <h3 id="step-2-open-a-project">Step 2: Open a Project</h3>
            <p>
              Now that you&apos;ve created a project (or maybe you already had
              one), it&apos;s time to dive in! Look for your project card on the
              dashboard. You can either click anywhere on the card to open it,
              or if you&apos;re feeling fancy, click the little open icon in the
              top right corner of the card. It&apos;s like choosing between
              using the front door or the secret passage – both get you inside,
              but one feels a bit more James Bond-ish.
            </p>
            <h3 id="step-3-name-your-project">Step 3: Name Your Project</h3>
            <p>
              Now comes the fun part – naming your project. Will it be{" "}
              <strong>&#39;Operation Awesome&#39;</strong>?{" "}
              <strong>&#39;Project X&#39;</strong>? Or perhaps{" "}
              <strong>
                &#39;The Thing I Should Have Started Last Month&#39;
              </strong>
              ? Whatever you choose, make it memorable and descriptive. Pro tip:
              Avoid names like <strong>&#39;Stuff To Do&#39;</strong> unless you
              want future-you to be very confused.
            </p>
            <figure>
              <Image
                src={createProject}
                alt="Animated GIF showing how to use the project board"
                width={923}
                height={475}
                loading="lazy"
                className="rounded-lg shadow-md border border-gray-2000"
              />
            </figure>
            <figcaption
              id="caption"
              className="text-center text-muted-foreground"
            >
              You can create a project by clicking the New Project button.
            </figcaption>
          </section>
          <section id="task-management" className="scroll-mt-20">
            <h2>
              Task Management Overview: Tasks, Deliverables and Content - The
              Building Blocks of Success
            </h2>
            <p>
              Now, it&#39;s time to dive into the heart of TaskManager-AI: task
              management. Think of tasks as the Lego blocks of your project –
              individually, they might not look like much, but stack them
              together, and you&#39;ve got yourself a productivity masterpiece!
            </p>
            <h3 id="creating-tasks-as-easy-as-pie-but-less-messy-">
              Creating Tasks: As Easy as Pie (But Less Messy)
            </h3>
            <ol>
              <li>
                Navigating to your project board (you know, the one you lovingly
                just created).
              </li>
              <li>
                Look for the <strong>&#39;Add Task&#39;</strong> button –
                it&#39;s usually hanging out at the bottom of each column,
                looking all inviting.
              </li>
              <li>
                Click it, and voila! A new task card appears, like magic (but
                it&#39;s actually just good UI design).
              </li>
              <li>
                Give your task a snappy title. Remember,{" "}
                <strong>&#39;Do the thing&#39;</strong> is less helpful than{" "}
                <strong>&#39;Write blog post about cat memes&#39;</strong>.
              </li>
              <li>
                Add a description if you&#39;re feeling fancy. Future you will
                thank present you for the extra details.
              </li>
            </ol>
            <figure>
              <Image
                src={createTask}
                alt="Animated GIF showing how to create a task"
                width={980}
                height={533}
                loading="lazy"
                className="rounded-lg shadow-md border border-gray-200"
              />
              <figcaption
                id="caption"
                className="text-center text-muted-foreground"
              >
                You can create a task by clicking the Add Task button.
              </figcaption>
            </figure>
          </section>
          <section id="deliverables" className="scroll-mt-20">
            <h2>
              Deliverables: Because we Forgot to Call it &#39;Subtasks&#39;
            </h2>
            <p>
              Now, let&#39;s talk about deliverables – the unsung heroes of task
              management. They&#39;re like mini-tasks that live inside your main
              tasks. Meta, right?
            </p>
            <h3 id="to-add-a-deliverable-">To add a deliverable:</h3>
            <ol>
              <li>
                Open your task card (a gentle click will do, no need to
                manhandle your mouse).
              </li>
              <li>
                Look for the <strong>&#39;Add Deliverable&#39;</strong> button.
                It&#39;s probably feeling lonely, so give it some love.
              </li>
              <li>Once created you can click the pencil icon to open.</li>
              <li>
                Create your deliverable with a title, description, and due date.
              </li>
            </ol>
            <p>
              <strong>Why use deliverables?</strong> Well, they help break down
              your tasks into manageable chunks. It&#39;s like turning an
              intimidating mountain of work into a series of gentle,
              productivity-filled hills.
            </p>
            <figure>
              <Image
                src={createDeliverable}
                alt="Animated GIF showing how to create a deliverable"
                width={980}
                height={533}
                loading="lazy"
                className="rounded-lg shadow-md border border-gray-200"
              />
              <figcaption
                id="caption"
                className="text-center text-muted-foreground"
              >
                You can create a deliverable by clicking the Add Deliverable
                button.
              </figcaption>
            </figure>
          </section>
          <section id="content-management" className="scroll-mt-20">
            <h2>Content: Where the Rubber Meets the Road</h2>
            <p>
              Here&#39;s where things get real. Deliverable content is where you
              actually, you know, do the work. It&#39;s the policy you wrote,
              the code you crafted, or the interpretive dance routine you
              choreographed (hey, we don&#39;t judge your projects).
            </p>
            <h3 id="to-add-content-to-a-deliverable-">
              To add content to a deliverable:
            </h3>
            <ol>
              <li>
                Open your deliverable (it&#39;s nested in your task, remember?).
              </li>
              <li>
                Click on the content area. It&#39;s like a blank canvas, but for
                productivity instead of art.
              </li>
              <li>
                Start typing, pasting, or interpretive dance notating. Whatever
                floats your boat.
              </li>
            </ol>
            <p>
              Remember, this is your evidence of completion. It&#39;s like a
              productivity receipt, but instead of proving you bought too many
              snacks, it proves you actually did your work.
            </p>
            <figure>
              <Image
                src={createContent}
                alt="Animated GIF showing how to create content"
                width={980}
                height={533}
                loading="lazy"
                className="rounded-lg shadow-md border border-gray-200"
              />
              <figcaption
                id="caption"
                className="text-center text-muted-foreground"
              >
                You can create content by clicking in the content area and
                typing.
              </figcaption>
            </figure>
          </section>
          <section id="ai-superpowers" className="scroll-mt-20">
            <h2>AI Superpowers: Your New Digital Assistant</h2>
            <p>
              Welcome to the future of project management, where your digital
              assistant is powered by AI and ready to supercharge your
              productivity! TaskManager-AI isn&#39;t just another
              run-of-the-mill project management tool; it&#39;s like having a
              super-smart intern who never sleeps, never complains, and
              occasionally tells dad jokes. Let&#39;s dive into the AI features
              that&#39;ll make you feel like you&#39;ve got productivity
              superpowers!
            </p>
            <h3 id="the-all-powerful-chat-interface">
              The All-Powerful Chat Interface
            </h3>
            <p>
              Imagine having a project management genie at your fingertips.
              That&#39;s essentially what our AI chat interface is, minus the
              fancy lamp and limited wishes. This intelligent chatbot is your
              go-to for anything (Create, Read, Update, Delete) across the
              application. Need to create a new task? Update a deliverable?
              Delete that embarrassing typo in your project description? Just
              ask the AI, and it&#39;ll take care of it faster than you can say{" "}
              <strong>&#39;project management ninja.&#39;</strong>
            </p>
            <p>
              But wait, there&#39;s more! Our AI assistant isn&#39;t just a
              glorified button-pusher. It&#39;s smart enough to understand
              context and provide helpful suggestions. For example, if you ask
              to create a new task, it might prompt you for additional details
              or suggest related deliverables based on your project history.
              It&#39;s like having a mind-reading assistant, but less creepy and
              more helpful.
            </p>
            <figure>
              <Image
                src={aiCreateProject}
                alt="Animated GIF showing how to create a project with AI"
                width={980}
                height={533}
                loading="lazy"
                className="rounded-lg shadow-md border border-gray-200"
              />
              <figcaption
                id="caption"
                className="text-center text-muted-foreground"
              >
                You can ask the AI to create a full project plan.
              </figcaption>
            </figure>
          </section>
          <section id="ai-assisted-completion" className="scroll-mt-20">
            <h2>But I Want More: Use AI to Complete Deliverables</h2>
            <p>
              Managing a plan is one thing, but let&#39;s raise the bar higher.
              If the AI can create a plan, can it complete the task? Let&#39;s
              dive into one of TaskManager-AI&#39;s most exciting features:
              AI-assisted deliverable completion.
            </p>
            <h3 id="the-blank-page-blues-not-anymore-">
              The Blank Page Blues? Not Anymore!
            </h3>
            <p>
              We&#39;ve all been there - staring at a blank document, cursor
              blinking mockingly as we struggle to start a deliverable. Well,
              wave goodbye to writer&#39;s block because our AI is here to
              kick-start your creativity!
            </p>
            <p>With TaskManager-AI, you can:</p>
            <ol>
              <li>
                Click the magical <strong>&#39;Ask AI&#39;</strong> button next
                to your deliverable content.
              </li>
              <li>
                Choose from options like{" "}
                <strong>&#39;Draft Deliverable&#39;</strong> or{" "}
                <strong>&#39;Custom Prompt.&#39;</strong>
              </li>
              <li>
                Watch in awe as AI-generated content appears before your eyes!
              </li>
            </ol>
            <p>
              It&#39;s like having a first draft fairy - but instead of leaving
              a coin under your pillow, it leaves a fully-formed starting point
              for your work.
            </p>
            <figure>
              <Image
                src={aiCreateDeliverable}
                alt="Animated GIF showing how to create a deliverable with AI"
                width={980}
                height={533}
                loading="lazy"
                className="rounded-lg shadow-md border border-gray-200"
              />
              <figcaption
                id="caption"
                className="text-center text-muted-foreground"
              >
                You can ask the AI to draft, revise, or complete a deliverable.
              </figcaption>
            </figure>
          </section>
          <section id="conclusion" className="scroll-mt-20">
            <h2>Conclusion: Your Productivity Journey Begins</h2>
            <p>
              Congratulations! You&#39;ve reached the end of our whirlwind tour
              through TaskManager-AI, the Swiss Army knife of project management
              (but with fewer pointy bits and more AI-powered awesomeness).
              Let&#39;s recap the key features that will transform you into a
              productivity superhero:
            </p>
            <ol>
              <li>
                <strong>Project Creation:</strong> Your launchpad for success,
                where ideas bloom into actionable plans.
              </li>
              <li>
                <strong>Task Management:</strong> Herd those cats—er, tasks—with
                ease and precision.
              </li>
              <li>
                <strong>Deliverables:</strong> The proof in your productivity
                pudding, breaking down tasks into manageable chunks.
              </li>
              <li>
                <strong>Deliverable Content:</strong> Where your brilliant ideas
                come to life, all neatly organized and accessible.
              </li>
              <li>
                <strong>AI Superpowers:</strong> Your digital assistant, ready
                to tackle CRUD operations and plan world domination (or just
                your next project).
              </li>
              <li>
                <strong>AI-Assisted Deliverables:</strong> Writer&#39;s block?
                Let AI kickstart your creativity and watch your productivity
                soar.
              </li>
            </ol>
            <p>
              Remember, TaskManager-AI is your playground for productivity.
              Don&#39;t be afraid to explore, experiment, and push the
              boundaries of what&#39;s possible. Create wild and wacky project
              structures, challenge the AI with complex requests, or see how
              many dad jokes you can squeeze into your deliverable content
              (spoiler alert: the AI assistant might just out-dad-joke you).
            </p>
            <p>
              As you embark on your productivity journey, keep in mind that
              TaskManager-AI is here to amplify your brilliance, not replace it.
              You&#39;re the maestro orchestrating this symphony of tasks and
              deliverables. The AI is just your trusty baton, helping you keep
              the rhythm and occasionally pulling a rabbit out of a hat.
            </p>
            <p>
              So go forth, intrepid project manager! Conquer those to-do lists,
              vanquish procrastination, and leave a trail of completed tasks in
              your wake. With TaskManager-AI by your side, you&#39;re not just
              managing projects—you&#39;re crafting productivity masterpieces.
            </p>
            <p>
              And remember, if all else fails, you can always ask the AI to{" "}
              <strong>
                &#39;make it look like I&#39;ve been productive all day.&#39;
              </strong>{" "}
              (Results may vary, and we take no responsibility for any resulting
              promotions or suspicious looks from your boss.)
            </p>
            <p>
              Happy TaskManager-AI-ing, and may your projects always be on time,
              under budget, and sprinkled with just the right amount of AI
              magic!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

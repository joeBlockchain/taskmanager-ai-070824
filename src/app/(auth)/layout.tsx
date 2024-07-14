// app/(application)/layout.tsx

import { PropsWithChildren } from "react";

export default function ApplicationLayout({ children }: PropsWithChildren) {
  return (
    <div>
      {/* Add your application-specific layout components */}
      {/* <nav>Auth Nav </nav> */}
      {children}
      {/* <footer>Auth Footer</footer> */}
    </div>
  );
}

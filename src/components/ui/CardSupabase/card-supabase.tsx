import { ReactNode } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '../card';

interface Props {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export default function CardSupabase({
  title,
  description,
  footer,
  children
}: Props) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent> {children}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
      {/* <div className="w-full max-w-3xl m-auto my-8 border rounded-md p border-zinc-700">
        <div className="px-5 py-4">
          <h3 className="mb-1 text-2xl font-medium">{title}</h3>
          <p className="text-zinc-300">{description}</p>
          {children}
        </div>
        {footer && (
          <div className="p-4 border-t rounded-b-md border-zinc-700 bg-zinc-900 text-zinc-500">
            {footer}
          </div>
        )}
      </div> */}
    </>
  );
}

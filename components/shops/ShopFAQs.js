import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '../ui/card';

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 py-4 text-left"
      >
        <span className="text-sm font-medium text-foreground">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{answer}</p>}
    </div>
  );
}

export default function ShopFAQs({ faqs }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!faqs?.length) return null;

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-bold text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="mt-4">
          {faqs.map((faq, idx) => (
            <FAQItem
              key={faq.question || idx}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === idx}
              onToggle={() => setOpenIndex(openIndex === idx ? -1 : idx)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

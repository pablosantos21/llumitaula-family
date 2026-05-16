import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
                <h3 className="font-medium text-gray-900 text-left">{title}</h3>
                <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                        isOpen ? 'transform rotate-180' : ''
                    }`}
                />
            </button>
            {isOpen && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    {children}
                </div>
            )}
        </div>
    );
}

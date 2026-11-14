import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}

export function AccordionItem({
    title,
    children,
    defaultOpen = false,
    onOpenChange,
}: AccordionItemProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const baseId = useId();
    const triggerId = `${baseId}-trigger`;
    const panelId = `${baseId}-panel`;

    const handleToggle = () => {
        const nextOpen = !isOpen;
        setIsOpen(nextOpen);
        onOpenChange?.(nextOpen);
    };

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                type="button"
                id={triggerId}
                onClick={handleToggle}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
                <h3 className="font-medium text-gray-900 text-left">{title}</h3>
                <ChevronDown
                    aria-hidden="true"
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                        isOpen ? 'transform rotate-180' : ''
                    }`}
                />
            </button>
            {isOpen && (
                <div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    className="border-t border-gray-200 p-4 bg-gray-50"
                >
                    {children}
                </div>
            )}
        </div>
    );
}

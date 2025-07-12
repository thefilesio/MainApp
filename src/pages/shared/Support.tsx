import { useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Pastikan path ini benar
import { toast } from "sonner"; // Saya asumsikan Anda menggunakan Sonner untuk notifikasi

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Support = () => {
    // State untuk form
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const faqItems = [
        // ... (data FAQ Anda tidak berubah)
        {
            question: "What is a Chatbot Builder?",
            answer: "Chatbot Builder is a no-code platform that allows you to create AI-powered chatbots for your website without any programming knowledge. You can set up a chatbot, define its personality, and embed it on your website with just a few clicks.",
        },
        {
            question: "Which AI models are supported?",
            answer: "We currently support GPT-4o, GPT-4, and GPT-3.5 models from OpenAI. You can choose the model that best fits your needs and budget.",
        },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !subject || !message) {
            toast.error("Please fill out all fields.");
            return;
        }
        setIsLoading(true);

        try {
            // Panggil Edge Function 'create-ticket'
            const payload = { name, email, subject, message };
            const { data, error } = await supabase.functions.invoke('resend-email', {
                body:JSON.stringify(payload),
            });

            if (error) {
                throw error;
            }

            toast.success("Message sent successfully! We'll get back to you soon.");
            // Reset form
            setName("");
            setEmail("");
            setSubject("");
            setMessage("");

        } catch (error) {
            console.error("Error sending message:", error);
            toast.error(`Failed to send message`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dark:text-white">
            {/* ... bagian atas komponen Anda tidak berubah ... */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#2AB6A6] mb-1">
                        Support
                    </h1>
                    <p className="text-gray-500 dark:text-gray-300 mt-2 text-base">
                        Have questions or need assistance? We're here to help!
                        Contact us for support
                    </p>
                </div>
            </div>

            <div
                className="grid grid-cols-1 lg:grid-cols-2 gap-10 dark:bg-main-dark p-4 dark:border-2 dark:border-gray-700"
                style={{ borderRadius: "8px" }}
            >
                <div>
                    <h2 className="chatbot-subheading mb-6 font-extrabold">
                        Frequently Asked Questions
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                        {faqItems.map((item, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger>
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent>
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                <div>
                    <h2 className="chatbot-subheading font-extrabold mb-6">
                        Contact Us
                    </h2>
                    <Card style={{ borderRadius: "8px" }} className="bg-white dark:bg-main-dark dark:text-white">
                        <CardHeader>
                            <CardTitle>Send a Message</CardTitle>
                            <CardDescription>
                                Fill out this form and we'll get back to you as
                                soon as possible.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium">
                                            Name
                                        </label>
                                        <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">
                                            Email
                                        </label>
                                        <Input id="email" type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium">
                                        Subject
                                    </label>
                                    <Input id="subject" placeholder="What's this about?" value={subject} onChange={(e) => setSubject(e.target.value)} disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium">
                                        Message
                                    </label>
                                    <Textarea id="message" placeholder="How can we help you?" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} disabled={isLoading} />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Sending...' : 'Send Message'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Support;
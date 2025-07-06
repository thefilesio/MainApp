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
import { FileQuestion, HelpCircle, Mail } from "lucide-react";

const Support = () => {
    const faqItems = [
        {
            question: "What is a Chatbot Builder?",
            answer: "Chatbot Builder is a no-code platform that allows you to create AI-powered chatbots for your website without any programming knowledge. You can set up a chatbot, define its personality, and embed it on your website with just a few clicks.",
        },
        {
            question: "Which AI models are supported?",
            answer: "We currently support GPT-4o, GPT-4, and GPT-3.5 models from OpenAI. You can choose the model that best fits your needs and budget.",
        },
        {
            question: "How do I create my first chatbot?",
            answer: "To create your first chatbot, navigate to the 'Build Agent' page, click on 'Create a Bot' and fill in the required information. Once created, you can further customize it and test it in the 'Demo Agent' section.",
        },
        {
            question: "How do I embed the chatbot on my website?",
            answer: "After configuring your chatbot, go to the 'Launch Agent' page where you can customize the appearance of your chat widget. Once you're satisfied, click on 'Generate Embed Code' and copy the code to your website's HTML.",
        },
        {
            question: "What are Temperature and Top-P settings?",
            answer: "Temperature and Top-P are parameters that control the randomness and diversity of the AI's responses. A higher temperature (closer to 1) makes the output more random, while a lower value makes it more deterministic. Top-P (nucleus sampling) controls how many different word choices the model considers.",
        },
    ];

    return (
        <div className="dark:text-white">
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
                            <form className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="name"
                                            className="text-sm font-medium"
                                        >
                                            Name
                                        </label>
                                        <Input
                                            id="name"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="email"
                                            className="text-sm font-medium"
                                        >
                                            Email
                                        </label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Your email"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="subject"
                                        className="text-sm font-medium"
                                    >
                                        Subject
                                    </label>
                                    <Input
                                        id="subject"
                                        placeholder="What's this about?"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="message"
                                        className="text-sm font-medium"
                                    >
                                        Message
                                    </label>
                                    <Textarea
                                        id="message"
                                        placeholder="How can we help you?"
                                        rows={4}
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    Send Message
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

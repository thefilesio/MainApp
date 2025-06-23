
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileQuestion, HelpCircle, Mail } from "lucide-react";

const Support = () => {
  const faqItems = [
    {
      question: "What is a Chatbot Builder?",
      answer: "Chatbot Builder is a no-code platform that allows you to create AI-powered chatbots for your website without any programming knowledge. You can set up a chatbot, define its personality, and embed it on your website with just a few clicks."
    },
    {
      question: "Which AI models are supported?",
      answer: "We currently support GPT-4o, GPT-4, and GPT-3.5 models from OpenAI. You can choose the model that best fits your needs and budget."
    },
    {
      question: "How do I create my first chatbot?",
      answer: "To create your first chatbot, navigate to the 'Build Agent' page, click on 'Create a Bot' and fill in the required information. Once created, you can further customize it and test it in the 'Demo Agent' section."
    },
    {
      question: "How do I embed the chatbot on my website?",
      answer: "After configuring your chatbot, go to the 'Launch Agent' page where you can customize the appearance of your chat widget. Once you're satisfied, click on 'Generate Embed Code' and copy the code to your website's HTML."
    },
    {
      question: "What are Temperature and Top-P settings?",
      answer: "Temperature and Top-P are parameters that control the randomness and diversity of the AI's responses. A higher temperature (closer to 1) makes the output more random, while a lower value makes it more deterministic. Top-P (nucleus sampling) controls how many different word choices the model considers."
    },
  ];

  return (
    <div>
      <h1 className="chatbot-heading mb-8">Support</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="mr-2 h-5 w-5" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Our extensive documentation covers everything you need to know about using Chatbot Builder.
            </p>
            <Button variant="outline" className="w-full">
              View Documentation
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileQuestion className="mr-2 h-5 w-5" />
              FAQs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Find quick answers to commonly asked questions about our platform.
            </p>
            <Button variant="outline" className="w-full">
              Browse FAQs
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Need personalized help? Our support team is ready to assist you.
            </p>
            <Button variant="outline" className="w-full">
              Contact Us
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h2 className="chatbot-subheading mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div>
          <h2 className="chatbot-subheading mb-6">Contact Us</h2>
          <Card>
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
              <CardDescription>
                Fill out this form and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" type="email" placeholder="Your email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                  <Input id="subject" placeholder="What's this about?" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <Textarea 
                    id="message" 
                    placeholder="How can we help you?" 
                    rows={4} 
                  />
                </div>
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;

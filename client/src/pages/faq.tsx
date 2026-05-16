import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Helmet>
        <title>Frequently Asked Questions | ConnectList</title>
        <meta 
          name="description" 
          content="Find answers to common questions about ConnectList - posting listings, account management, payments, and more."
        />
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-4">frequently asked questions</h1>
        <p className="mb-4 text-sm leading-relaxed">
          find answers to common questions about using connectlist. if you can't find the answer you're looking for, please feel free to <a href="/contact" className="text-blue-700 hover:underline">contact us</a>.
        </p>
      </div>
      
      <Accordion type="single" collapsible className="mb-8">
        <AccordionItem value="item-1" className="border-b border-gray-200">
          <AccordionTrigger className="text-sm font-medium py-3 text-left">what is connectlist?</AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed pb-3">
            connectlist is a Web3-native platform designed to foster personal connections, job opportunities, and business services in a decentralized, community-driven environment. it functions similarly to traditional classified platforms but with integrated Web3 features.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2" className="border-b border-gray-200">
          <AccordionTrigger className="text-sm font-medium py-3 text-left">how do i create an account?</AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed pb-3">
            to create an account, click on the "register" link in the top navigation bar. you'll need to provide an email address, create a password, and set up a security question and answer for account recovery purposes.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3" className="border-b border-gray-200">
          <AccordionTrigger className="text-sm font-medium py-3 text-left">how do i post a listing?</AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed pb-3">
            once logged in, click on the "post" button in the header. select your listing category (personal, job, or business), fill out the listing details form, and submit. your listing will be active immediately after submission.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-4" className="border-b border-gray-200">
          <AccordionTrigger className="text-sm font-medium py-3 text-left">how much does it cost to post a listing?</AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed pb-3">
            basic listings are free on connectlist. premium features such as featuring your listing at the top of search results, extending the listing duration, or adding enhanced visibility options require payment. these are priced in USD but paid using cryptocurrency.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-5" className="border-b border-gray-200">
          <AccordionTrigger className="text-sm font-medium py-3 text-left">which cryptocurrencies do you accept for payments?</AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed pb-3">
            we currently accept major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), and USDC for payments. payments are processed through our secure integration with cryptocurrency payment processors.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-6" className="border-b border-gray-200">
          <AccordionTrigger className="text-sm font-medium py-3 text-left">what happens if i forget my password?</AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed pb-3">
            if you forget your password, click on the "forgot password" link on the login page. you'll be asked to provide your email address and answer your security question. if successful, you'll be able to create a new password.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-7" className="border-b border-gray-200">
          <AccordionTrigger className="text-sm font-medium py-3 text-left">how long do listings stay active?</AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed pb-3">
            standard listings remain active for 30 days. after this period, they will automatically expire. you can renew or repost expired listings from your account dashboard.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-8" className="border-b border-gray-200">
          <AccordionTrigger className="text-sm font-medium py-3 text-left">how do i report inappropriate content?</AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed pb-3">
            if you come across content that violates our terms of service, click the "report" button on the listing. provide details about why you're reporting the listing, and our moderation team will review it promptly.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-9" className="border-b border-gray-200">
          <AccordionTrigger className="text-sm font-medium py-3 text-left">is my personal information safe?</AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed pb-3">
            we take data security seriously. your personal information is protected using industry-standard security measures. we only collect information necessary to provide our services and do not share your personal data with third parties except as described in our privacy policy.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-10" className="border-b border-gray-200">
          <AccordionTrigger className="text-sm font-medium py-3 text-left">how do i delete my account?</AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed pb-3">
            to delete your account, go to your account settings and select the "delete account" option. this action is permanent and will remove all your personal information and listings from our platform.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div>
        <h2 className="text-lg font-medium mb-2">still have questions?</h2>
        <p className="text-sm leading-relaxed">
          if you couldn't find the answer to your question, please <a href="/contact" className="text-blue-700 hover:underline">contact us</a> and we'll be happy to help.
        </p>
      </div>
    </div>
  );
}
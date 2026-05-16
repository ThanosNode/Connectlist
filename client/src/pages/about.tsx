import { Helmet } from "react-helmet-async";

export default function About() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Helmet>
        <title>About | ConnectList</title>
        <meta 
          name="description" 
          content="Learn about ConnectList - a Web3-native platform designed to foster personal connections, job opportunities, and business services."
        />
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-4">about connectlist</h1>
        <p className="mb-4 text-sm leading-relaxed">
          A Web3-native platform designed to foster personal connections, job opportunities, and business services in a decentralized, community-driven environment.
        </p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">our mission</h2>
        <p className="mb-4 text-sm leading-relaxed">
          connectlist aims to create an open marketplace that leverages blockchain technology to provide transparent, secure, and efficient connections between individuals and businesses in the Web3 ecosystem.
        </p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">web3 focus</h2>
        <p className="mb-4 text-sm leading-relaxed">
          unlike traditional classified platforms, connectlist is built with Web3 principles at its core:
        </p>
        <ul className="list-disc pl-5 text-sm leading-relaxed mb-4">
          <li className="mb-2">cryptocurrency payments for premium listings and features</li>
          <li className="mb-2">decentralized identity options for enhanced privacy</li>
          <li className="mb-2">community governance for platform moderation</li>
          <li className="mb-2">transparent fee structure with on-chain verification</li>
        </ul>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">categories</h2>
        <p className="mb-4 text-sm leading-relaxed">
          connectlist offers listings across three main categories:
        </p>
        <ul className="list-disc pl-5 text-sm leading-relaxed">
          <li className="mb-2"><span className="text-blue-700">personal</span> - for individual connections, meetups, study groups, and mentorship</li>
          <li className="mb-2"><span className="text-blue-700">jobs</span> - for employment opportunities in the Web3 space</li>
          <li className="mb-2"><span className="text-blue-700">business</span> - for services, products, and business partnerships</li>
        </ul>
      </div>
      
      <div>
        <h2 className="text-lg font-medium mb-2">join our community</h2>
        <p className="text-sm leading-relaxed">
          connectlist is more than a platform—it's a community. we encourage active participation, feedback, and suggestions to continually improve the platform for everyone.
        </p>
      </div>
    </div>
  );
}
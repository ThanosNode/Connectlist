import { Helmet } from "react-helmet-async";

export default function Terms() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Helmet>
        <title>Terms of Service | ConnectList</title>
        <meta 
          name="description" 
          content="Review ConnectList's Terms of Service, including user responsibilities, platform rules, and legal requirements for using our Web3-focused classified platform."
        />
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-4">terms of service</h1>
        <p className="mb-4 text-sm text-gray-600">
          last updated: may 13, 2023
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          please read these terms of service carefully before using connectlist. by accessing or using connectlist, you agree to be bound by these terms.
        </p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">1. acceptance of terms</h2>
        <p className="mb-4 text-sm leading-relaxed">
          by accessing or using connectlist, you acknowledge that you have read, understood, and agree to be bound by these terms of service. if you do not agree to these terms, please do not use connectlist.
        </p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">2. user accounts</h2>
        <p className="mb-4 text-sm leading-relaxed">
          to use certain features of connectlist, you may need to create an account. you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. you must provide accurate and complete information when creating your account and keep your account information updated.
        </p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">3. user conduct</h2>
        <p className="mb-4 text-sm leading-relaxed">
          you agree not to:
        </p>
        <ul className="list-disc pl-5 text-sm leading-relaxed mb-4">
          <li className="mb-2">post content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
          <li className="mb-2">impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
          <li className="mb-2">post unauthorized commercial communications (such as spam)</li>
          <li className="mb-2">engage in any activity that interferes with or disrupts connectlist's services</li>
          <li className="mb-2">attempt to access any part of connectlist that you are not authorized to access</li>
        </ul>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">4. content and listings</h2>
        <p className="mb-4 text-sm leading-relaxed">
          you are solely responsible for any content you post on connectlist, including listings. all listings must comply with our content guidelines. connectlist reserves the right to remove any listing that violates these terms or our content guidelines at our sole discretion.
        </p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">5. cryptocurrency transactions</h2>
        <p className="mb-4 text-sm leading-relaxed">
          certain services on connectlist may involve cryptocurrency transactions. you acknowledge the inherent risks associated with cryptocurrencies, including price volatility, regulatory uncertainty, and security risks. connectlist is not responsible for any losses resulting from cryptocurrency transactions.
        </p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">6. intellectual property</h2>
        <p className="mb-4 text-sm leading-relaxed">
          connectlist and its content are protected by copyright, trademark, and other laws. our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of connectlist.
        </p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">7. limitation of liability</h2>
        <p className="mb-4 text-sm leading-relaxed">
          connectlist is provided on an "as is" and "as available" basis. to the maximum extent permitted by law, connectlist disclaims all warranties, express or implied, including the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
        </p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">8. changes to terms</h2>
        <p className="mb-4 text-sm leading-relaxed">
          connectlist reserves the right to modify these terms at any time. we will provide notice of significant changes to these terms by posting the new terms on the platform and updating the "last updated" date. your continued use of connectlist after such changes constitutes your acceptance of the new terms.
        </p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">9. 2257 exemption statement</h2>
        <p className="mb-4 text-sm leading-relaxed">
          exemption statement content produced by third parties: the operators of this website are not the producers of any depictions of actual or simulated sexually explicit conduct submitted by its third party users / members. instead, the activities of the operators of this website, with respect to such content, are limited to the transmission, storage, retrieval, hosting and/or formatting of depictions posted directly to the website by third party users, on areas of the website under their control.
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          connectlist.org is a community website in which allows for the uploading, sharing and general viewing of various types of adult content and while connectlist.org's support staff do their best they can with verifying compliance, it may not be 100% accurate.
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          connectlist.org is a community website, not a producer of content. its only obligation is to cooperate to immediately withdraw the content once the infraction of the site's guidelines are identified.
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          the procedures we use for compliance: the website permits the submission of user submissions and the hosting, sharing, and/or publishing of such user submissions. a) requiring all users to be over 18 years old to join, hence, upload pictures or videos. b) connectlist.org allows content to be flagged as a violation. should any content be flagged as illegal, unlawful, harassing, harmful, offensive or various other reasons, connectlist.org's support staff shall review the content and take appropriate action.
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          uploader is solely responsible for your own user submissions and the consequences of posting or publishing them by accepting our terms of use. we permit the submission of photos and videos and other communications submitted by you and other users ("user submissions") and the hosting, sharing, and/or publishing of such user submissions.
        </p>
      </div>
      
      <div>
        <h2 className="text-lg font-medium mb-2">10. contact</h2>
        <p className="text-sm leading-relaxed">
          if you have any questions about these terms, please contact us at <a href="mailto:devservicerelay@gmail.com" className="text-blue-700 hover:underline">devservicerelay@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}
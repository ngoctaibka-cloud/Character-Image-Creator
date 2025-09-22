
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full text-center mt-6 py-4">
            <p className="text-sm text-muted-text">
                Contact Zalo for support and updates: 
                <a 
                    href="https://zalo.me/84973974519" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-green hover:underline ml-1"
                >
                    https://zalo.me/84973974519
                </a>
            </p>
        </footer>
    );
};

export default Footer;

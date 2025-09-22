
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="text-center">
            <h1 className="text-[36px] font-extrabold text-title-green">
                Character Image Creator
            </h1>
            <p className="text-sm text-muted-text mt-1">
                Bring your characters to life in any scene.
            </p>
        </header>
    );
};

export default Header;

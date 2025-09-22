
import React from 'react';
import Card from './Card';
import { GeneratedImage } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';

interface GalleryPanelProps {
    images: GeneratedImage[];
    onDownloadAll: () => void;
}

const GalleryPanel: React.FC<GalleryPanelProps> = ({ images, onDownloadAll }) => {
    const renderGrid = () => {
        if (images.length === 0) {
            return (
                <div className="aspect-[1/1] flex items-center justify-center text-muted-text">
                    <p>Your generated images will appear here.</p>
                </div>
            );
        }
        
        if (images.length === 3) {
            return (
                <div className="grid grid-cols-2 gap-3">
                    <img src={images[0].src} alt="Generated character 1" className="w-full h-full object-cover rounded-[10px] border border-border-color hover:scale-[1.01] transition-transform"/>
                    <img src={images[1].src} alt="Generated character 2" className="w-full h-full object-cover rounded-[10px] border border-border-color hover:scale-[1.01] transition-transform"/>
                    <div className="col-span-2 flex justify-center">
                        <img src={images[2].src} alt="Generated character 3" className="w-1/2 h-full object-cover rounded-[10px] border border-border-color hover:scale-[1.01] transition-transform"/>
                    </div>
                </div>
            )
        }
        
        return (
             <div className="grid grid-cols-2 gap-3">
                {images.map(image => (
                    <img 
                        key={image.id} 
                        src={image.src} 
                        alt={`Generated character ${image.id}`} 
                        className="w-full h-full object-cover rounded-[10px] border border-border-color hover:scale-[1.01] transition-transform" 
                    />
                ))}
            </div>
        )
    };

    return (
        <Card className="min-h-[780px]">
            <div className="flex justify-end mb-4">
                <button 
                    onClick={onDownloadAll}
                    disabled={images.length === 0}
                    className="bg-download-bg border border-border-color rounded-xl px-4 py-2 flex items-center gap-2 text-sm text-body-text hover:border-muted-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <DownloadIcon />
                    Download All
                </button>
            </div>
            {renderGrid()}
        </Card>
    );
};

export default GalleryPanel;


import React, { useState, useCallback } from 'react';
import { FormState, GeneratedImage, Quality } from './types';
import { INITIAL_FORM_STATE } from './constants';
import { generateCharacterImages } from './services/geminiService';
import Header from './components/Header';
import ControlsPanel from './components/ControlsPanel';
import GalleryPanel from './components/GalleryPanel';
import Footer from './components/Footer';

declare global {
    interface Window {
        JSZip: any;
    }
}

const App: React.FC = () => {
    const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateFormState = useCallback((updates: Partial<FormState>) => {
        setFormState(prev => ({ ...prev, ...updates }));
    }, []);

    const handleGenerate = async () => {
        setError(null);
        if (formState.images.length === 0) {
            setError("Please upload at least one reference image.");
            return;
        }
        if (!formState.characterDesc.trim()) {
            setError("Character Description cannot be empty.");
            return;
        }

        setIsLoading(true);
        try {
            const imageResults = await generateCharacterImages(formState);
            const imagesWithIds = imageResults.map((src, index) => ({
                id: `img-${Date.now()}-${index}`,
                src
            }));
            setGeneratedImages(imagesWithIds);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartOver = () => {
        setFormState(INITIAL_FORM_STATE);
        setGeneratedImages([]);
        setError(null);
    };

    const handleDownloadAll = async () => {
        if (generatedImages.length === 0) return;
        const zip = new window.JSZip();
        
        const imagePromises = generatedImages.map(async (image, index) => {
            const response = await fetch(image.src);
            const blob = await response.blob();
            zip.file(`character_${index + 1}.png`, blob);
        });

        await Promise.all(imagePromises);

        zip.generateAsync({ type: "blob" }).then((content: Blob) => {
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'character-images.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    };
    
    return (
        <div className="bg-page-bg text-body-text font-sans min-h-screen flex flex-col items-center p-6">
            <div className="w-full max-w-[1180px]">
                <Header />
                <main className="grid grid-cols-1 lg:grid-cols-2 justify-center gap-6 mt-8 items-start">
                    <ControlsPanel
                        formState={formState}
                        onStateChange={updateFormState}
                        onGenerate={handleGenerate}
                        onStartOver={handleStartOver}
                        isLoading={isLoading}
                        error={error}
                    />
                    <GalleryPanel
                        images={generatedImages}
                        onDownloadAll={handleDownloadAll}
                    />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default App;

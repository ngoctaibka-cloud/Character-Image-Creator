
import React, { useCallback, useRef } from 'react';
import { FormState, Quality } from '../types';
import { QUALITY_OPTIONS } from '../constants';
import Card from './Card';

// Sub-components defined in the same file to keep file count low, but could be separated.

// --- ToggleSwitch ---
interface ToggleSwitchProps {
    label: string;
    helperText: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, helperText, checked, onChange }) => (
    <div>
        <div className="flex items-center justify-between">
            <label className="text-body-text font-medium">{label}</label>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`${
                    checked ? 'bg-primary-green' : 'bg-toggle-off'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-2 focus:ring-offset-panel-bg`}
            >
                <span
                    aria-hidden="true"
                    className={`${
                        checked ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-thumb shadow ring-0 transition duration-200 ease-in-out`}
                />
            </button>
        </div>
        <p className="text-muted-text text-xs mt-1">{helperText}</p>
    </div>
);

// --- InfluenceSlider ---
interface InfluenceSliderProps {
    enabled: boolean;
    onEnabledChange: (enabled: boolean) => void;
    strength: number;
    onStrengthChange: (strength: number) => void;
}
const InfluenceSlider: React.FC<InfluenceSliderProps> = ({ enabled, onEnabledChange, strength, onStrengthChange }) => (
    <div>
        <div className="flex items-center justify-between">
            <label className="text-body-text font-medium">Reference Influence</label>
            <button
                type="button"
                onClick={() => onEnabledChange(!enabled)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                    enabled ? 'bg-primary-green text-panel-bg' : 'bg-toggle-off text-body-text'
                }`}
            >
                {enabled ? 'ON' : 'OFF'}
            </button>
        </div>
        <div className={`mt-3 ${!enabled ? 'opacity-50' : ''}`}>
            <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={strength}
                disabled={!enabled}
                onChange={(e) => onStrengthChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-toggle-off rounded-lg appearance-none cursor-pointer accent-primary-green"
            />
            <p className="text-muted-text text-xs mt-1 text-right">Strength: {strength}%</p>
        </div>
    </div>
);

// --- Dropzone ---
interface DropzoneProps {
    onFilesChange: (files: File[]) => void;
}
const Dropzone: React.FC<DropzoneProps> = ({ onFilesChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onFilesChange(Array.from(e.target.files));
        }
    };
    return (
        <div
            className="w-full h-[140px] border-2 border-dashed border-border-color rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-green transition-colors"
            onClick={() => inputRef.current?.click()}
        >
            <input type="file" multiple accept="image/*" ref={inputRef} className="hidden" onChange={handleFileChange} />
            <p className="text-body-text">Click to upload</p>
            <p className="text-muted-text text-xs mt-1">You can select multiple images</p>
        </div>
    );
};

// --- Main ControlsPanel ---
interface ControlsPanelProps {
    formState: FormState;
    onStateChange: (updates: Partial<FormState>) => void;
    onGenerate: () => void;
    onStartOver: () => void;
    isLoading: boolean;
    error: string | null;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({ formState, onStateChange, onGenerate, onStartOver, isLoading, error }) => {
    
    const handleFilesChange = (files: File[]) => {
        onStateChange({ images: files });
    };

    return (
        <Card className="flex flex-col gap-6">
            <div>
                <h2 className="text-lg font-bold">1. Upload Reference Image(s)</h2>
                <div className="mt-4 flex flex-col gap-4">
                    <Dropzone onFilesChange={handleFilesChange} />
                     {formState.images.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            {formState.images.map((file, index) => (
                                <img
                                    key={index}
                                    src={URL.createObjectURL(file)}
                                    alt={`preview ${index}`}
                                    className="w-16 h-16 object-cover rounded-md border border-border-color"
                                    onLoad={e => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                />
                            ))}
                        </div>
                    )}
                    <ToggleSwitch
                        label="Background Removal"
                        helperText="Remove background from reference images before generation."
                        checked={formState.removeBackground}
                        onChange={removeBackground => onStateChange({ removeBackground })}
                    />
                    <InfluenceSlider
                        enabled={formState.influenceEnabled}
                        onEnabledChange={influenceEnabled => onStateChange({ influenceEnabled })}
                        strength={formState.influenceStrength}
                        onStrengthChange={influenceStrength => onStateChange({ influenceStrength })}
                    />
                </div>
            </div>

            <hr className="border-t border-border-color" />

            <div>
                <h2 className="text-lg font-bold">2. Character(s) Description</h2>
                <textarea
                    value={formState.characterDesc}
                    onChange={e => onStateChange({ characterDesc: e.target.value })}
                    className="mt-4 w-full h-[100px] bg-input-bg border border-border-color rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary-green"
                />
            </div>

            <hr className="border-t border-border-color" />

            <div>
                <h2 className="text-lg font-bold">3. Scene & Action</h2>
                 <textarea
                    value={formState.sceneDesc}
                    onChange={e => onStateChange({ sceneDesc: e.target.value })}
                    className="mt-4 w-full h-[80px] bg-input-bg border border-border-color rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary-green"
                />
            </div>
            
            <hr className="border-t border-border-color" />
            
            <div>
                 <h2 className="text-lg font-bold">4. Output Quality</h2>
                 <div className="grid grid-cols-3 gap-3 mt-4">
                     {QUALITY_OPTIONS.map(option => (
                         <button
                            key={option.id}
                            type="button"
                            onClick={() => onStateChange({ quality: option.id })}
                            className={`p-3 rounded-xl border transition-all duration-200 text-center ${
                                formState.quality === option.id 
                                ? 'border-primary-green bg-primary-green/10 shadow-glow-green' 
                                : 'border-border-color bg-input-bg hover:border-muted-text'
                            }`}
                         >
                            <span className="font-semibold text-sm text-body-text">{option.label}</span>
                            <span className="block text-xs text-muted-text mt-1">{option.caption}</span>
                         </button>
                     ))}
                 </div>
            </div>

            {error && <p className="text-error text-sm text-center">{error}</p>}

            <div className="flex items-center gap-4">
                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="h-[52px] w-full bg-primary-green hover:bg-primary-green-hover active:bg-primary-green-active rounded-xl text-panel-bg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Generate Images'}
                </button>
                <button
                    onClick={onStartOver}
                    className="flex-shrink-0 px-4 py-2 text-sm text-muted-text hover:text-body-text transition-colors"
                >
                    Start Over
                </button>
            </div>

        </Card>
    );
};

export default ControlsPanel;

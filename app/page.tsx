File 1: app/page.tsx (Main Application)

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mic, MicOff, Save, Search } from 'lucide-react';

interface ExtractedData {
  [key: string]: string;
}

const defaultFields = [
  'date of birth',
  'first name',
  'last name',
  'address',
  'beneficiary',
  'beneficiary phone number',
  'client address'
];

export default function InfoCapture() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [keywords, setKeywords] = useState<string[]>(defaultFields);
  const [customFields, setCustomFields] = useState<string[]>(['', '', '']);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState('');
  const [usageCount, setUsageCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [recentMatches, setRecentMatches] = useState<string[]>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPart = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptPart;
            }
          }

          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript + ' ');
            extractKeywords(finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          if (isListening) {
            recognitionRef.current?.start();
          }
        };
      }
    }
  }, [isListening]);

  const extractKeywords = (text: string) => {
    const allFields = [...keywords, ...customFields.filter(f => f.trim())];
    const lowerText = text.toLowerCase();
    
    allFields.forEach(field => {
      if (field.trim() && lowerText.includes(field.toLowerCase())) {
        const words = text.split(' ');
        const fieldIndex = words.findIndex(word => 
          word.toLowerCase().includes(field.toLowerCase().split(' ')[0])
        );
        
        if (fieldIndex !== -1 && fieldIndex < words.length - 1) {
          const extractedValue = words.slice(fieldIndex + 1, fieldIndex + 3).join(' ');
          setExtractedData(prev => ({
            ...prev,
            [field]: extractedValue
          }));
          
          setRecentMatches(prev => [field, ...prev.slice(0, 4)]);
        }
      }
    });
  };

  const toggleListening = () => {
    if (!isPro && usageCount >= 3) {
      alert('You\'ve reached your free usage limit. Upgrade to InfoCapture Pro for unlimited uses!');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        if (!isPro) {
          setUsageCount(prev => prev + 1);
        }
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchResults(`Search results for "${searchQuery}" would appear here. This would integrate with a search API in the full implementation.`);
  };

  const saveSession = async () => {
    console.log('Saving session:', { transcript, extractedData });
    alert('Session saved successfully!');
  };

  const upgradeToPro = () => {
    setIsPro(true);
    alert('Upgraded to InfoCapture Pro! You now have unlimited usage.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">InfoCapture</h1>
          <p className="text-gray-600">AI-Powered Speech-to-Text with Smart Field Extraction</p>
          <div className="flex justify-center items-center gap-4 mt-4">
            <Badge variant={isPro ? "default" : "secondary"}>
              {isPro ? "Pro User" : `Free: ${usageCount}/3 uses`}
            </Badge>
            {!isPro && (
              <Button onClick={upgradeToPro} size="sm" className="bg-green-600 hover:bg-green-700">
                Upgrade to Pro - $47
              </Button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Speech Recognition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Button
                  onClick={toggleListening}
                  size="lg"
                  className={`w-32 h-32 rounded-full ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {isListening ? 'Listening... Speak now' : 'Click to start recording'}
                </p>
              </div>

              {recentMatches.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Recent Matches:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {recentMatches.map((match, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {match}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Extracted Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {keywords.map((field) => (
                  <div key={field}>
                    <Label className="text-sm font-medium capitalize">{field}</Label>
                    <Input
                      value={extractedData[field] || ''}
                      onChange={(e) => setExtractedData(prev => ({
                        ...prev,
                        [field]: e.target.value
                      }))}
                      placeholder={`Auto-extracted ${field}`}
                      className="mt-1"
                    />
                  </div>
                ))}
                
                {customFields.map((field, index) => (
                  field.trim() && (
                    <div key={`custom-${index}`}>
                      <Label className="text-sm font-medium capitalize">{field}</Label>
                      <Input
                        value={extractedData[field] || ''}
                        onChange={(e) => setExtractedData(prev => ({
                          ...prev,
                          [field]: e.target.value
                        }))}
                        placeholder={`Auto-extracted ${field}`}
                        className="mt-1"
                      />
                    </div>
                  )
                ))}
              </div>
              
              <Button onClick={saveSession} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Session
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Your speech will appear here as you talk..."
                className="min-h-[200px] resize-none"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Internet Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search the internet..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {searchResults && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">{searchResults}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Field Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Default Fields (Always Active)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {keywords.map((field) => (
                    <Badge key={field} variant="default">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium">Custom Fields (Add up to 3)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  {customFields.map((field, index) => (
                    <Input
                      key={index}
                      value={field}
                      onChange={(e) => {
                        const newFields = [...customFields];
                        newFields[index] = e.target.value;
                        setCustomFields(newFields);
                      }}
                      placeholder={`Custom field ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

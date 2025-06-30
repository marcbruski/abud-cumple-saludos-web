
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Play, Pause, Edit2, Trash2, Heart, Star } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Greeting {
  id: string;
  name: string;
  message: string;
  audioBlob?: Blob;
  audioUrl?: string;
  timestamp: Date;
}

const Index = () => {
  const [greetings, setGreetings] = useState<Greeting[]>([]);
  const [newGreeting, setNewGreeting] = useState({ name: '', message: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setNewGreeting(prev => ({ ...prev, audioBlob: blob }));
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 20) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const playAudio = (audioUrl: string, greetingId: string) => {
    if (audioRef.current) {
      if (playingAudio === greetingId) {
        audioRef.current.pause();
        setPlayingAudio(null);
      } else {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setPlayingAudio(greetingId);
        audioRef.current.onended = () => setPlayingAudio(null);
      }
    }
  };

  const handleSubmit = () => {
    if (!newGreeting.name.trim() || (!newGreeting.message.trim() && !audioUrl)) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa tu nombre y agrega un mensaje o grabación",
        variant: "destructive"
      });
      return;
    }

    const greeting: Greeting = {
      id: Date.now().toString(),
      name: newGreeting.name,
      message: newGreeting.message,
      audioUrl: audioUrl || undefined,
      timestamp: new Date()
    };

    if (editingId) {
      setGreetings(prev => prev.map(g => g.id === editingId ? greeting : g));
      setEditingId(null);
    } else {
      setGreetings(prev => [...prev, greeting]);
    }

    setNewGreeting({ name: '', message: '' });
    setAudioUrl(null);
    setRecordingTime(0);
    
    toast({
      title: "¡Saludo agregado!",
      description: "Tu mensaje para Ernesto ha sido guardado exitosamente",
    });
  };

  const handleEdit = (greeting: Greeting) => {
    setNewGreeting({ name: greeting.name, message: greeting.message });
    setAudioUrl(greeting.audioUrl || null);
    setEditingId(greeting.id);
  };

  const handleDelete = (id: string) => {
    setGreetings(prev => prev.filter(g => g.id !== id));
    toast({
      title: "Saludo eliminado",
      description: "El mensaje ha sido eliminado exitosamente",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewGreeting({ name: '', message: '' });
    setAudioUrl(null);
    setRecordingTime(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 bg-gradient-to-r from-blue-600 to-yellow-500 text-white p-8 rounded-2xl shadow-2xl">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Star className="w-8 h-8 text-yellow-300" />
            <Heart className="w-8 h-8 text-red-300" />
            <Star className="w-8 h-8 text-yellow-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Saludamos a Ernesto Abud
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold">
            por su 60 cumpleaños
          </h2>
          <div className="mt-4 text-lg opacity-90">
            ¡Comparte tus mejores deseos y felicitaciones!
          </div>
        </div>

        {/* Greeting Form */}
        <Card className="mb-8 shadow-xl border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-yellow-400 text-white">
            <CardTitle className="text-2xl">
              {editingId ? 'Editar Saludo' : 'Agregar Nuevo Saludo'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tu nombre
              </label>
              <Input
                placeholder="Escribe tu nombre"
                value={newGreeting.name}
                onChange={(e) => setNewGreeting(prev => ({ ...prev, name: e.target.value }))}
                className="border-2 border-blue-300 focus:border-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje escrito
              </label>
              <Textarea
                placeholder="Escribe tu saludo para Ernesto..."
                value={newGreeting.message}
                onChange={(e) => setNewGreeting(prev => ({ ...prev, message: e.target.value }))}
                className="border-2 border-blue-300 focus:border-yellow-500"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje de voz (opcional - máximo 20 segundos)
              </label>
              <div className="flex items-center gap-4">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "destructive" : "default"}
                  className={isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}
                >
                  {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                  {isRecording ? `Detener (${recordingTime}s)` : 'Grabar'}
                </Button>
                
                {audioUrl && (
                  <Button
                    onClick={() => playAudio(audioUrl, 'preview')}
                    variant="outline"
                    className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  >
                    {playingAudio === 'preview' ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    Reproducir
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-500 to-yellow-500 hover:from-blue-600 hover:to-yellow-600 text-white"
              >
                {editingId ? 'Actualizar Saludo' : 'Enviar Saludo'}
              </Button>
              
              {editingId && (
                <Button 
                  onClick={cancelEdit}
                  variant="outline"
                  className="border-2 border-gray-400"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Greetings List */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-blue-800 text-center">
            Saludos para Ernesto ({greetings.length})
          </h3>
          
          {greetings.length === 0 ? (
            <Card className="text-center p-8 bg-blue-50 border-2 border-blue-200">
              <p className="text-lg text-blue-600">
                ¡Sé el primero en dejar un saludo para Ernesto!
              </p>
            </Card>
          ) : (
            greetings.map((greeting) => (
              <Card key={greeting.id} className="shadow-lg border-2 border-yellow-200 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500 text-white">
                        {greeting.name}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {greeting.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(greeting)}
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(greeting.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {greeting.message && (
                    <p className="text-gray-700 mb-4 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                      {greeting.message}
                    </p>
                  )}
                  
                  {greeting.audioUrl && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => playAudio(greeting.audioUrl!, greeting.id)}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        {playingAudio === greeting.id ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {playingAudio === greeting.id ? 'Pausar' : 'Reproducir'} audio
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Credits */}
        <div className="fixed bottom-4 right-4 bg-green-200 text-black p-3 rounded-lg shadow-lg border-2 border-green-300">
          <div className="text-sm font-semibold">By Marcelo Bruski</div>
          <div className="text-xs">marcbruski@yahoo.com</div>
        </div>

        {/* Hidden audio element */}
        <audio ref={audioRef} className="hidden" />
      </div>
    </div>
  );
};

export default Index;

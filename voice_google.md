// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import {
  GoogleGenAI,
} from '@google/genai';
import mime from 'mime';
import { writeFile } from 'fs';

function saveBinaryFile(fileName: string, content: Buffer) {
  writeFile(fileName, content, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing file ${fileName}:`, err);
      return;
    }
    console.log(`File ${fileName} saved to file system.`);
  });
}

async function main() {
  const ai = new GoogleGenAI({
    apiKey: process.env['GEMINI_API_KEY'],
  });
  const config = {
    temperature: 1.6,
    responseModalities: [
        'audio',
    ],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: 'Pulcherrima',
        }
      }
    },
  };
  const model = 'gemini-3.8-flash-tts';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `## Transcript:
<argh> Hello everyone!!! I am here because I had a really harsh heartbreak! <cry> <chuckle> <exhales> `,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  let fileIndex = 0;
  for await (const chunk of response) {
    if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
      continue;
    }
    if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const fileName = `ENTER_FILE_NAME_${fileIndex++}`;
      const inlineData = chunk.candidates[0].content.parts[0].inlineData;
      let fileExtension = mime.getExtension(inlineData.mimeType || '');
      let buffer = Buffer.from(inlineData.data || '', 'base64');
      if (!fileExtension) {
        fileExtension = 'wav';
        buffer = convertToWav(inlineData.data || '', inlineData.mimeType || '');
      }
      saveBinaryFile(`${fileName}.${fileExtension}`, buffer);
    }
    else {
      console.log(chunk.text);
    }
  }
}

main();

interface WavConversionOptions {
  numChannels : number,
  sampleRate: number,
  bitsPerSample: number
}

function convertToWav(rawData: string, mimeType: string) {
  const options = parseMimeType(mimeType)
  const wavHeader = createWavHeader(rawData.length, options);
  const buffer = Buffer.from(rawData, 'base64');

  return Buffer.concat([wavHeader, buffer]);
}

function parseMimeType(mimeType : string) {
  const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
  const [_, format] = fileType.split('/');

  const options : Partial<WavConversionOptions> = {
    numChannels: 1,
  };

  if (format && format.startsWith('L')) {
    const bits = parseInt(format.slice(1), 10);
    if (!isNaN(bits)) {
      options.bitsPerSample = bits;
    }
  }

  for (const param of params) {
    const [key, value] = param.split('=').map(s => s.trim());
    if (key === 'rate') {
      options.sampleRate = parseInt(value, 10);
    }
  }

  return options as WavConversionOptions;
}

function createWavHeader(dataLength: number, options: WavConversionOptions) {
  const {
    numChannels,
    sampleRate,
    bitsPerSample,
  } = options;

  // http://soundfile.sapp.org/doc/WaveFormat

  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const buffer = Buffer.alloc(44);

  buffer.write('RIFF', 0);                      // ChunkID
  buffer.writeUInt32LE(36 + dataLength, 4);     // ChunkSize
  buffer.write('WAVE', 8);                      // Format
  buffer.write('fmt ', 12);                     // Subchunk1ID
  buffer.writeUInt32LE(16, 16);                 // Subchunk1Size (PCM)
  buffer.writeUInt16LE(1, 20);                  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);        // NumChannels
  buffer.writeUInt32LE(sampleRate, 24);         // SampleRate
  buffer.writeUInt32LE(byteRate, 28);           // ByteRate
  buffer.writeUInt16LE(blockAlign, 32);         // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34);      // BitsPerSample
  buffer.write('data', 36);                     // Subchunk2ID
  buffer.writeUInt32LE(dataLength, 40);         // Subchunk2Size

  return buffer;
}




> ## AI Agent Context
> - Full documentation index: https://aistudio.google.com/llms.txt
> - Gemini Docs MCP server (consistent live info): https://gemini-api-docs-mcp.dev
> - Coding agent skills & setup guide: https://aistudio.google.com/docs/coding-agents.md

# Text-to-speech generation (TTS)

The Gemini API can transform text input into single-speaker or multi-speaker
audio using Gemini text-to-speech (TTS) generation capabilities.
Text-to-speech generation is
*[controllable](/docs/speech-generation#controllable)*, meaning you can combine
structured turn metadata (`speech_metadata`) and inline vocal tags to guide the
*style*, *accent*, *pace*, and *tone* of the audio.

The TTS capability differs from speech generation provided through the
[Live API](/docs/live-api), which is designed for interactive,
unstructured audio, and multimodal inputs and outputs. While the Live API excels
in dynamic conversational contexts, TTS through the Gemini API
is tailored for scenarios that require exact text recitation with fine-grained
control over style and sound, such as podcast or audiobook generation.

This guide shows you how to generate single-speaker and multi-speaker audio from
text using [Gemini 3.8 Flash TTS](/docs/models/gemini-3.8-flash-tts)
(`gemini-3.8-flash-tts`) and
[Gemini 3.8 Flash-Lite TTS](/docs/models/gemini-3.8-flash-lite-tts)
(`gemini-3.8-flash-lite-tts`).

## Before you begin  {% class="hide-from-toc" id="before-you-begin" %}

Ensure you use a Gemini TTS model listed in the
[Supported models](/docs/speech-generation#supported-models) section, and
upgrade to the latest Google GenAI SDK (`google-genai >= 2.25.0` for Python or
`@google/genai >= 2.24.0` for JavaScript/TypeScript) or use the REST API. For
optimal results, review
[When to use which model](/docs/speech-generation#when-to-use-which-model) to
select the best model for your workload.

You may find it useful to
[test the Gemini TTS models in AI Studio](https://aistudio.google.com/generate-speech)
before you start building.

{% callout type="note" %}
  TTS models accept text-only inputs and produce audio-only outputs. For a
  complete list of restrictions specific to TTS models, review the
  [Limitations](/docs/speech-generation#limitations) section.

{% /callout %}

## Single-speaker TTS  {% id="single-speaker" %}

To convert text to single-speaker audio with Gemini 3.8 TTS models, pass the
verbatim transcript in `input`, attach turn-level styling using a
`speech_metadata` annotation, and configure your voice in
`generation_config.speech_config`. You can choose a voice from the prebuilt
[voice options](/docs/speech-generation#voices), the Extended Voice Library
(`GET /v1beta/voices`), a custom [Voice design](/docs/voice-design) or
[Voice remixing](/docs/voice-remixing) ID (`voice_...`), or a
[Voice replication](/docs/voice-replication) ID (`voice_...`, or optional
stateless `voicekey_...`).

This example saves the output audio from the model in a WAV file:

{% tabs %}
  {% tab label="Python" %}
  ```python
  import base64
  from google import genai
  
  client = genai.Client(http_options={"api_version": "v1beta"})
  
  interaction = client.interactions.create(
      model="gemini-3.8-flash-tts",
      input=[{
          "type": "user_input",
          "content": [{
              "type": "text",
              "text": "Have a wonderful day!",
              "annotations": [{
                  "type": "speech_metadata",
                  "style": "cheerful and friendly",
              }],
          }],
      }],
      response_format={"type": "audio"},
      generation_config={
          "speech_config": [
              {"voice": "Kore"},
          ]
      },
  )
  
  with open("out.wav", "wb") as f:
      f.write(base64.b64decode(interaction.output_audio.data))
  ```

  {% /tab %}

  {% tab label="JavaScript" %}
  ```js
  import {GoogleGenAI} from '@google/genai';
  import * as fs from 'node:fs';
  
  async function main() {
     const client = new GoogleGenAI({ httpOptions: { apiVersion: "v1beta" } });
  
     const interaction = await client.interactions.create({
        model: 'gemini-3.8-flash-tts',
        input: [{
           type: 'user_input',
           content: [{
              type: 'text',
              text: 'Have a wonderful day!',
              annotations: [{
                 type: 'speech_metadata',
                 style: 'cheerful and friendly',
              }],
           }],
        }],
        response_format: { type: 'audio' },
        generation_config: {
           speech_config: [
              { voice: 'Kore' },
           ],
        },
     });
  
     if (interaction.output_audio?.data) {
        const audioBuffer = Buffer.from(interaction.output_audio.data, 'base64');
        fs.writeFileSync('out.wav', audioBuffer);
     }
  }
  await main();
  ```

  {% /tab %}

  {% tab label="REST" %}
  ```sh
  curl -X POST "https://generativelanguage.googleapis.com/v1beta/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gemini-3.8-flash-tts",
      "input": [{
        "type": "user_input",
        "content": [{
          "type": "text",
          "text": "Have a wonderful day!",
          "annotations": [{
            "type": "speech_metadata",
            "style": "cheerful and friendly"
          }]
        }]
      }],
      "response_format": {
         "type": "audio"
       },
      "generation_config": {
        "speech_config": [
          { "voice": "Kore" }
        ]
      }
    }' | jq -r '[.steps[] | select(.type=="model_output") | .content[] | select(.type=="audio")] | last | .data' | base64 --decode > out.wav
  ```

  {% /tab %}

  {% tab label="CLI" %}
  ```bash
  # Note: tts does not send speech_metadata style annotations.
  gemini-api tts 'Have a wonderful day!' --voice Kore --out out.wav
  ```

  {% /tab %}

{% /tabs %}

In the Python and JavaScript SDKs, you can retrieve generated audio data by
using the `interaction.output_audio` convenience property, which returns the
last generated audio block (in raw REST JSON responses, the base64-encoded audio
is stored in `steps[].content[].data`).

## Multi-speaker TTS  {% id="multi-speaker" %}

For multi-speaker dialogue, configure two speakers in `speech_config.speakers`
and pass each turn as a separate text item with a `speech_metadata` annotation
specifying the `speaker` and optional turn-level `style`. Notice that
`speech_config` accepts an array (`[{"voice": "..."}]`) for single-speaker
generation and an object (`{"speakers": [...]}`) for multi-speaker generation:

{% tabs %}
  {% tab label="Python" %}
  ```python
  import base64
  from google import genai
  
  client = genai.Client(http_options={"api_version": "v1beta"})
  
  interaction = client.interactions.create(
      model="gemini-3.8-flash-tts",
      input=[{
          "type": "user_input",
          "content": [
              {
                  "type": "text",
                  "text": "How's it going today Jane?",
                  "annotations": [{
                      "type": "speech_metadata",
                      "speaker": "Joe",
                      "style": "cheerful and friendly",
                  }],
              },
              {
                  "type": "text",
                  "text": "Not too bad, how about you? Ready to test these new voices?",
                  "annotations": [{
                      "type": "speech_metadata",
                      "speaker": "Jane",
                      "style": "calm and relaxed",
                  }],
              },
          ],
      }],
      response_format={"type": "audio"},
      generation_config={
          "speech_config": {
              "speakers": [
                  {"speaker": "Joe", "voice": "Puck"},
                  {"speaker": "Jane", "voice": "Kore"},
              ],
          }
      },
  )
  
  with open("out.wav", "wb") as f:
      f.write(base64.b64decode(interaction.output_audio.data))
  ```

  {% /tab %}

  {% tab label="JavaScript" %}
  ```js
  import {GoogleGenAI} from '@google/genai';
  import * as fs from 'node:fs';
  
  async function main() {
     const client = new GoogleGenAI({ httpOptions: { apiVersion: "v1beta" } });
  
     const interaction = await client.interactions.create({
        model: 'gemini-3.8-flash-tts',
        input: [{
           type: 'user_input',
           content: [
              {
                 type: 'text',
                 text: "How's it going today Jane?",
                 annotations: [{
                    type: 'speech_metadata',
                    speaker: 'Joe',
                    style: 'cheerful and friendly',
                 }],
              },
              {
                 type: 'text',
                 text: 'Not too bad, how about you? Ready to test these new voices?',
                 annotations: [{
                    type: 'speech_metadata',
                    speaker: 'Jane',
                    style: 'calm and relaxed',
                 }],
              },
           ],
        }],
        response_format: { type: 'audio' },
        generation_config: {
           speech_config: {
              speakers: [
                 { speaker: 'Joe', voice: 'Puck' },
                 { speaker: 'Jane', voice: 'Kore' },
              ],
           },
        },
     });
  
     if (interaction.output_audio?.data) {
        const audioBuffer = Buffer.from(interaction.output_audio.data, 'base64');
        fs.writeFileSync('out.wav', audioBuffer);
     }
  }
  
  await main();
  ```

  {% /tab %}

  {% tab label="REST" %}
  ```sh
  curl -X POST "https://generativelanguage.googleapis.com/v1beta/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
    "model": "gemini-3.8-flash-tts",
    "input": [{
      "type": "user_input",
      "content": [
        {
          "type": "text",
          "text": "How'\''s it going today Jane?",
          "annotations": [{
            "type": "speech_metadata",
            "speaker": "Joe",
            "style": "cheerful and friendly"
          }]
        },
        {
          "type": "text",
          "text": "Not too bad, how about you? Ready to test these new voices?",
          "annotations": [{
            "type": "speech_metadata",
            "speaker": "Jane",
            "style": "calm and relaxed"
          }]
        }
      ]
    }],
    "response_format": {
         "type": "audio"
       },
    "generation_config": {
      "speech_config": {
        "speakers": [
          { "speaker": "Joe", "voice": "Puck" },
          { "speaker": "Jane", "voice": "Kore" }
        ]
      }
    }
  }'
  ```

  {% /tab %}

  {% tab label="CLI" %}
  ```bash
  # Note: tts does not send per-turn speech_metadata style annotations.
  gemini-api tts "Joe: How's it going today Jane? Jane: Not too bad, how about you? Ready to test these new voices?" \
    --multi-speaker "Joe=Puck,Jane=Kore" --out out.wav
  ```

  {% /tab %}

{% /tabs %}

## Control speech style with metadata and tags  {% id="controllable" %}

Gemini 3.8 TTS treats the `text` field strictly as a verbatim transcript. To
control delivery without having stage directions read aloud, split your
instructions by scope:

*   **Sustained turn-level delivery (`speech_metadata.style`):** Put emotions,
    delivery style, prosody, pacing, and volume that apply across an entire turn
    in the `style` field (for example, `"style": "whispered urgently"`,
    `"style": "out of breath"`, or `"style": "warm and enthusiastic"`).
*   **Point-in-time events (inline tags):** Place momentary non-speech vocal
    bursts or pauses directly inside the transcript using angle brackets (for
    example, `"Wait... <short pause> did you hear that? <sigh>"` or
    `"Excuse me <cough> as I was saying..."`).

See the [Prompting guide](/docs/speech-generation#prompting-guide) for
comprehensive best practices.

{% tabs %}
  {% tab label="Python" %}
  ```python
  import base64
  from google import genai
  
  client = genai.Client(http_options={"api_version": "v1beta"})
  
  interaction = client.interactions.create(
      model="gemini-3.8-flash-tts",
      input=[{
          "type": "user_input",
          "content": [
              {
                  "type": "text",
                  "text": "Wait... <short pause> look under that fallen log! Is that a blue-spotted salamander?",
                  "annotations": [{
                      "type": "speech_metadata",
                      "speaker": "Dr. Anya",
                      "style": "whispered urgently",
                  }],
              },
              {
                  "type": "text",
                  "text": "<gasp> No way! <laugh> We've been searching for this species all season!",
                  "annotations": [{
                      "type": "speech_metadata",
                      "speaker": "Liam",
                      "style": "warm and enthusiastic",
                  }],
              },
          ],
      }],
      response_format={"type": "audio"},
      generation_config={
          "speech_config": {
              "speakers": [
                  {"speaker": "Dr. Anya", "voice": "Kore"},
                  {"speaker": "Liam", "voice": "Puck"},
              ],
          }
      },
  )
  
  with open("out.wav", "wb") as f:
      f.write(base64.b64decode(interaction.output_audio.data))
  ```

  {% /tab %}

  {% tab label="JavaScript" %}
  ```js
  import * as fs from 'node:fs';
  import {GoogleGenAI} from '@google/genai';
  
  async function main() {
     const client = new GoogleGenAI({ httpOptions: { apiVersion: "v1beta" } });
  
     const interaction = await client.interactions.create({
        model: 'gemini-3.8-flash-tts',
        input: [{
           type: 'user_input',
           content: [
              {
                 type: 'text',
                 text: 'Wait... <short pause> look under that fallen log! Is that a blue-spotted salamander?',
                 annotations: [{
                    type: 'speech_metadata',
                    speaker: 'Dr. Anya',
                    style: 'whispered urgently',
                 }],
              },
              {
                 type: 'text',
                 text: "<gasp> No way! <laugh> We've been searching for this species all season!",
                 annotations: [{
                    type: 'speech_metadata',
                    speaker: 'Liam',
                    style: 'warm and enthusiastic',
                 }],
              },
           ],
        }],
        response_format: { type: 'audio' },
        generation_config: {
           speech_config: {
              speakers: [
                 { speaker: 'Dr. Anya', voice: 'Kore' },
                 { speaker: 'Liam', voice: 'Puck' },
              ],
           },
        },
     });
  
     if (interaction.output_audio?.data) {
        const audioBuffer = Buffer.from(interaction.output_audio.data, 'base64');
        fs.writeFileSync('out.wav', audioBuffer);
     }
  }
  
  await main();
  ```

  {% /tab %}

  {% tab label="REST" %}
  ```sh
  curl -X POST "https://generativelanguage.googleapis.com/v1beta/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gemini-3.8-flash-tts",
      "input": [{
        "type": "user_input",
        "content": [
          {
            "type": "text",
            "text": "Wait... <short pause> look under that fallen log! Is that a blue-spotted salamander?",
            "annotations": [{
              "type": "speech_metadata",
              "speaker": "Dr. Anya",
              "style": "whispered urgently"
            }]
          },
          {
            "type": "text",
            "text": "<gasp> No way! <laugh> We'\''ve been searching for this species all season!",
            "annotations": [{
              "type": "speech_metadata",
              "speaker": "Liam",
              "style": "warm and enthusiastic"
            }]
          }
        ]
      }],
      "response_format": {
        "type": "audio"
      },
      "generation_config": {
        "speech_config": {
          "speakers": [
            { "speaker": "Dr. Anya", "voice": "Kore" },
            { "speaker": "Liam", "voice": "Puck" }
          ]
        }
      }
    }'
  ```

  {% /tab %}

{% /tabs %}

## Streaming speech generation  {% id="streaming" %}

You can stream the generated audio as it is being synthesized by setting
`stream: true`. Unlike unary requests (which return a complete WAV file with a
RIFF header), **streaming requests return headerless raw 16-bit signed
little-endian linear PCM (`audio/l16`, 24 kHz, mono) chunks by default** so
audio chunks can be played or concatenated continuously without container
headers.

{% tabs %}
  {% tab label="Python" %}
  ```python
  import base64
  from google import genai
  
  client = genai.Client(http_options={"api_version": "v1beta"})
  
  stream = client.interactions.create(
      model="gemini-3.8-flash-tts",
      input=[{
          "type": "user_input",
          "content": [{
              "type": "text",
              "text": "Have a wonderful day!",
              "annotations": [{
                  "type": "speech_metadata",
                  "style": "cheerful and friendly",
              }],
          }],
      }],
      response_format={"type": "audio"},
      generation_config={
          "speech_config": [
              {"voice": "Kore"},
          ]
      },
      stream=True,
  )
  
  for event in stream:
      if event.event_type == "step.delta":
          if event.delta.type == "audio":
              audio_data = base64.b64decode(event.delta.data)
  ```

  {% /tab %}

  {% tab label="JavaScript" %}
  ```js
  import {GoogleGenAI} from '@google/genai';
  
  async function main() {
     const client = new GoogleGenAI({ httpOptions: { apiVersion: "v1beta" } });
  
     const stream = await client.interactions.create({
        model: 'gemini-3.8-flash-tts',
        input: [{
           type: 'user_input',
           content: [{
              type: 'text',
              text: 'Have a wonderful day!',
              annotations: [{
                 type: 'speech_metadata',
                 style: 'cheerful and friendly',
              }],
           }],
        }],
        response_format: { type: 'audio' },
        generation_config: {
           speech_config: [
              { voice: 'Kore' },
           ],
        },
        stream: true,
     });
  
     for await (const event of stream) {
        if (event.event_type === 'step.delta') {
           if (event.delta.type === 'audio' && event.delta.data) {
              const audioBuffer = Buffer.from(event.delta.data, 'base64');
              // Process the audio buffer
           }
        }
     }
  }
  await main();
  ```

  {% /tab %}

  {% tab label="REST" %}
  ```sh
  curl -X POST "https://generativelanguage.googleapis.com/v1beta/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    --no-buffer \
    -d '{
      "model": "gemini-3.8-flash-tts",
      "input": [{
        "type": "user_input",
        "content": [{
          "type": "text",
          "text": "Have a wonderful day!",
          "annotations": [{
            "type": "speech_metadata",
            "style": "cheerful and friendly"
          }]
        }]
      }],
      "response_format": {
        "type": "audio"
      },
      "generation_config": {
        "speech_config": [
          { "voice": "Kore" }
        ]
      },
      "stream": true
    }'
  ```

  {% /tab %}

{% /tabs %}

## Audio output formats  {% id="audio-output-formats" %}

Gemini 3.8 TTS models use different default audio formats depending on whether
the request is unary or streaming:

*   **Unary requests (`stream=False`):** Return complete **WAV (`audio/wav`)**
    audio with a RIFF header (24 kHz, mono, 16-bit signed little-endian PCM).
    You can write the decoded base64 bytes directly to a `.wav` file without
    manually adding a WAV container.
*   **Streaming requests (`stream=True`):** Return **headerless raw Linear PCM
    (`audio/l16`)** chunks (24 kHz, mono, 16-bit signed little-endian PCM) by
    default so chunks can be streamed or concatenated continuously without
    container headers on each chunk.

You can override the output audio encoding and sample rate in `response_format`:

| `mime_type` value | Format | Description |
| :--- | :--- | :--- |
| `"audio/wav"` *(unary default)* | WAV | Complete WAV file with a RIFF header (24 kHz, mono, 16-bit PCM). |
| `"audio/l16"` *(streaming default)* | Linear PCM | Headerless raw 16-bit signed little-endian linear PCM (24 kHz, mono). Default for streaming requests. |
| `"audio/mulaw"` | μ-law | G.711 μ-law companded audio. Commonly used in North American and Japanese telephony (8 kHz). |
| `"audio/alaw"` | A-law | G.711 A-law companded audio. Commonly used in European and international telephony (8 kHz). |

You can also optionally specify `sample_rate` (for example, `24000`, `16000`, or
`8000` Hz; defaults to `24000` Hz).

The following example requests headerless raw 16-bit PCM (`audio/l16`) at
24 kHz:

{% tabs %}
  {% tab label="Python" %}
  ```python
  import base64
  from google import genai
  
  client = genai.Client(http_options={"api_version": "v1beta"})
  
  interaction = client.interactions.create(
      model="gemini-3.8-flash-tts",
      input=[{
          "type": "user_input",
          "content": [{
              "type": "text",
              "text": "Have a wonderful day!",
              "annotations": [{
                  "type": "speech_metadata",
                  "style": "cheerful and friendly",
              }],
          }],
      }],
      response_format={
          "type": "audio",
          "mime_type": "audio/l16",
          "sample_rate": 24000,
      },
      generation_config={
          "speech_config": [
              {"voice": "Kore"},
          ]
      },
  )
  
  with open("out.pcm", "wb") as f:
      f.write(base64.b64decode(interaction.output_audio.data))
  ```

  {% /tab %}

  {% tab label="JavaScript" %}
  ```js
  import {GoogleGenAI} from '@google/genai';
  import * as fs from 'node:fs';
  
  async function main() {
     const client = new GoogleGenAI({ httpOptions: { apiVersion: "v1beta" } });
  
     const interaction = await client.interactions.create({
        model: 'gemini-3.8-flash-tts',
        input: [{
           type: 'user_input',
           content: [{
              type: 'text',
              text: 'Have a wonderful day!',
              annotations: [{
                 type: 'speech_metadata',
                 style: 'cheerful and friendly',
              }],
           }],
        }],
        response_format: {
           type: 'audio',
           mime_type: 'audio/l16',
           sample_rate: 24000,
        },
        generation_config: {
           speech_config: [
              { voice: 'Kore' },
           ],
        },
     });
  
     if (interaction.output_audio?.data) {
        const audioBuffer = Buffer.from(interaction.output_audio.data, 'base64');
        fs.writeFileSync('out.pcm', audioBuffer);
     }
  }
  await main();
  ```

  {% /tab %}

  {% tab label="REST" %}
  ```sh
  curl -X POST "https://generativelanguage.googleapis.com/v1beta/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gemini-3.8-flash-tts",
      "input": [{
        "type": "user_input",
        "content": [{
          "type": "text",
          "text": "Have a wonderful day!",
          "annotations": [{
            "type": "speech_metadata",
            "style": "cheerful and friendly"
          }]
        }]
      }],
      "response_format": {
        "type": "audio",
        "mime_type": "audio/l16",
        "sample_rate": 24000
      },
      "generation_config": {
        "speech_config": [
          { "voice": "Kore" }
        ]
      }
    }'
  ```

  {% /tab %}

{% /tabs %}

## Voice options  {% id="voices" %}

Gemini 3.8 TTS supports five ways to select or create voices:

1.  **Prebuilt studio voices:** 30 curated voices listed in the following table.
2.  **Extended Voice Library:** Hundreds of additional voices across languages,
    accents, and character archetypes accessible using `client.voices.list()`
    (`GET /v1beta/voices`).
3.  **[Voice design](/docs/voice-design):** Generate a custom vocal persona from
    a natural-language description in
    [Google AI Studio](https://aistudio.google.com/generate-speech) or using
    `POST /v1beta/voices` (`type="prompted"`, which returns a persistent
    `voice_...` ID and a `sample_audio` WAV preview in `CreateVoice` and
    `GetVoice`).
4.  **[Voice replication](/docs/voice-replication):** Replicate a speaker's
    voice from reference and consent audio in
    [Google AI Studio](https://aistudio.google.com/generate-speech) or using
    `POST /v1beta/voices` (`type="replicated"`, persistent `store=True` by
    default or optional stateless `store=False`).
5.  **[Voice remixing](/docs/voice-remixing):** Modify a prebuilt or designed
    `base_voice` using natural-language instructions in
    [Google AI Studio](https://aistudio.google.com/generate-speech) or using
    `POST /v1beta/voices` (`type="prompted"`, `prompted.base_voice`, which
    stores a new independent `voice_...` resource and returns a `sample_audio`
    WAV preview).

### Custom voice limits and TTL  {% id="custom-voice-limits" %}

| Voice type | Storage mode | Quota / limit | Retention (TTL) |
| :--- | :--- | :--- | :--- |
| **Stateful voices** (`voice_...`, prompted or replicated) | `store=True` | **200 voices per project** (shared across prompted and replicated voices) | **1 year from last use**{% sup %}*{% /sup %} |
| **Stateless voice keys** (`voicekey_...`, replicated) | `store=False` | Client-managed | **7 days** |

{% sup %}*{% /sup %} **TTL extension:** The 1-year retention window resets each time the voice is actively used (either by synthesizing speech with the voice or using it as a base voice for remixing). Voices with no activity for 1 year are automatically deleted.

### Prebuilt voices  {% id="prebuilt-voices" %}

{% table %}
  * **Zephyr** -- *Bright*
  * **Puck** -- *Upbeat*
  * **Charon** -- *Informative*

  ---

  * **Kore** -- *Firm*
  * **Fenrir** -- *Excitable*
  * **Leda** -- *Youthful*

  ---

  * **Orus** -- *Firm*
  * **Aoede** -- *Breezy*
  * **Callirrhoe** -- *Easy-going*

  ---

  * **Autonoe** -- *Bright*
  * **Enceladus** -- *Breathy*
  * **Iapetus** -- *Clear*

  ---

  * **Umbriel** -- *Easy-going*
  * **Algieba** -- *Smooth*
  * **Despina** -- *Smooth*

  ---

  * **Erinome** -- *Clear*
  * **Algenib** -- *Gravelly*
  * **Rasalgethi** -- *Informative*

  ---

  * **Laomedeia** -- *Upbeat*
  * **Achernar** -- *Soft*
  * **Alnilam** -- *Firm*

  ---

  * **Schedar** -- *Even*
  * **Gacrux** -- *Mature*
  * **Pulcherrima** -- *Forward*

  ---

  * **Achird** -- *Friendly*
  * **Zubenelgenubi** -- *Casual*
  * **Vindemiatrix** -- *Gentle*

  ---

  * **Sadachbia** -- *Lively*
  * **Sadaltager** -- *Knowledgeable*
  * **Sulafat** -- *Warm*
{% /table %}

### Extended Voice Library and filtering  {% id="voice-library" %}

Beyond the 30 featured studio voices in the preceding table, the **Extended
Voice Library** provides hundreds of additional voices across languages, regional accents,
character personas, and domains. You can browse, filter, and audition the full
Voice Library interactively in
[Google AI Studio](https://aistudio.google.com/generate-speech), or query it
programmatically using `client.voices.list()` (`GET /v1beta/voices`, using
`google-genai` 2.25.0+ / `@google/genai` 2.24.0+).

`ListVoices` returns your custom stored voices (ordered newest first) followed
by prebuilt catalog voices matching your filter criteria. When multiple values
are passed for a list filter, voices matching **any** value in that filter are
returned (`OR`), while distinct filter parameters combine with `AND`:

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `language_code` | `list[str]` | BCP-47 language tag(s) (for example, `["en-US", "en-GB"]`). Case-insensitive exact match. |
| `region_code` | `list[str]` | ISO 3166-1 alpha-2 or UN M.49 region code(s) (for example, `["US", "GB"]`). |
| `accent` | `list[str]` | Regional accent descriptor(s) (for example, `["American", "British"]`). |
| `gender` | `list[str]` | Perceived gender presentation (`"female"`, `"male"`, or `"neutral"`). |
| `pitch` | `list[str]` | Vocal pitch classification (`"low"`, `"medium"`, or `"high"`). |
| `persona` | `list[str]` | Vocal persona or character archetype (for example, `["Warm, Friendly"]`, `["Narrator"]`). |
| `contexts` (`context` in REST) | `list[str]` | Optimal usage domain (for example, `["Audiobook", "Conversational", "News"]`). |
| `type` (`type_` in Python) | `list[str]` | Filter by voice source: `"prebuilt"`, `"prompted"` ([Voice design](/docs/voice-design) and [Voice remixing](/docs/voice-remixing)), or `"replicated"` ([Voice replication](/docs/voice-replication)). |
| `search` | `str` | Free-text substring search matched case-insensitively against both `display_name` and `description`. |
| `page_size` | `int` | Maximum number of voices returned per page (default `50`, maximum `1000`). |
| `page_token` | `str` | Token from `response.next_page_token` to fetch the next page of results. |

{% tabs %}
  {% tab label="Python" %}
  ```python
  from google import genai
  
  client = genai.Client(http_options={"api_version": "v1beta"})
  
  # Filter the Voice Library by language, gender, pitch, domain context, and keyword
  response = client.voices.list(
      language_code=["en-US", "en-GB"],
      gender=["female"],
      pitch=["medium", "low"],
      contexts=["Audiobook", "Conversational"],
      type_=["prebuilt"],
      search="warm",
      page_size=50,
  )
  
  for voice in response.voices or []:
      print(
          f"{voice.id} | {voice.display_name} ({voice.language_code},"
          f" {voice.accent}, {voice.gender}, pitch={voice.pitch}):"
          f" {voice.description}"
      )
  ```

  {% /tab %}

  {% tab label="JavaScript" %}
  ```javascript
  import { GoogleGenAI } from "@google/genai";
  
  const ai = new GoogleGenAI({ httpOptions: { apiVersion: "v1beta" } });
  
  // Filter the Voice Library by language, gender, pitch, domain context, and keyword
  const response = await ai.voices.list({
    language_code: ["en-US", "en-GB"],
    gender: ["female"],
    pitch: ["medium", "low"],
    contexts: ["Audiobook", "Conversational"],
    type: ["prebuilt"],
    search: "warm",
    page_size: 50,
  });
  
  for (const voice of response.voices ?? []) {
    console.log(
      `${voice.id} | ${voice.display_name} (${voice.language_code}, ${voice.accent}, ${voice.gender}, pitch=${voice.pitch}): ${voice.description}`
    );
  }
  ```

  {% /tab %}

  {% tab label="REST" %}
  ```sh
  curl -G "https://generativelanguage.googleapis.com/v1beta/voices" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    --data-urlencode "language_code=en-US" \
    --data-urlencode "language_code=en-GB" \
    --data-urlencode "gender=female" \
    --data-urlencode "pitch=medium" \
    --data-urlencode "context=Audiobook" \
    --data-urlencode "type=prebuilt" \
    --data-urlencode "search=warm" \
    --data-urlencode "page_size=50"
  ```

  {% /tab %}

{% /tabs %}

## Supported languages  {% id="languages" %}

The TTS models detect the input language automatically.
[Gemini 3.8 Flash TTS](/docs/models/gemini-3.8-flash-tts)
(`gemini-3.8-flash-tts`) supports **over 130 languages**, and
[Gemini 3.8 Flash-Lite TTS](/docs/models/gemini-3.8-flash-lite-tts)
(`gemini-3.8-flash-lite-tts`) supports **over 100 languages**:

| Language | Gemini 3.8 Flash TTS | Gemini 3.8 Flash-Lite TTS |
| :--- | :--- | :--- |
| Acehnese (Arab script) | ✔️ | ✔️ |
| Afrikaans | ✔️ | ✔️ |
| Akan | ✔️ | ✔️ |
| Amharic | ✔️ | ✔️ |
| Armenian | ✔️ | ✔️ |
| Assamese | ✔️ | ✔️ |
| Awadhi | ✔️ | ✔️ |
| Balinese | ✔️ | ✔️ |
| Bangla | ✔️ | ✔️ |
| Banjar (Arab script) | ✔️ | — |
| Banjar (Latn script) | ✔️ | ✔️ |
| Bashkir | ✔️ | — |
| Basque | ✔️ | ✔️ |
| Belarusian | ✔️ | ✔️ |
| Bemba | ✔️ | — |
| Bhojpuri | ✔️ | ✔️ |
| Bosnian | ✔️ | ✔️ |
| Buginese | ✔️ | ✔️ |
| Bulgarian | ✔️ | ✔️ |
| Burmese | ✔️ | — |
| Cantonese | ✔️ | ✔️ |
| Catalan | ✔️ | ✔️ |
| Cebuano | ✔️ | ✔️ |
| Central Kurdish | ✔️ | ✔️ |
| Chhattisgarhi | ✔️ | ✔️ |
| Chinese (Hans script) | ✔️ | ✔️ |
| Chinese (Hant script) | ✔️ | ✔️ |
| Crimean Tatar | ✔️ | — |
| Croatian | ✔️ | ✔️ |
| Czech | ✔️ | ✔️ |
| Danish | ✔️ | ✔️ |
| Dutch | ✔️ | ✔️ |
| Dyula | ✔️ | — |
| Dzongkha | ✔️ | — |
| Egyptian Arabic | ✔️ | ✔️ |
| English | ✔️ | ✔️ |
| Estonian | ✔️ | ✔️ |
| Filipino | ✔️ | ✔️ |
| Finnish | ✔️ | — |
| French | ✔️ | ✔️ |
| Galician | ✔️ | ✔️ |
| Ganda | ✔️ | ✔️ |
| Georgian | ✔️ | ✔️ |
| German | ✔️ | ✔️ |
| Greek | ✔️ | ✔️ |
| Guarani | ✔️ | — |
| Gujarati | ✔️ | ✔️ |
| Haitian Creole | ✔️ | ✔️ |
| Halh Mongolian | ✔️ | ✔️ |
| Hausa | ✔️ | ✔️ |
| Hebrew | ✔️ | ✔️ |
| Hindi | ✔️ | ✔️ |
| Hungarian | ✔️ | ✔️ |
| Icelandic | ✔️ | ✔️ |
| Igbo | ✔️ | — |
| Iloko | ✔️ | ✔️ |
| Indonesian | ✔️ | ✔️ |
| Iranian Persian | ✔️ | ✔️ |
| Italian | ✔️ | ✔️ |
| Japanese | ✔️ | ✔️ |
| Javanese | ✔️ | ✔️ |
| Kabyle | ✔️ | — |
| Kamba | ✔️ | ✔️ |
| Kannada | ✔️ | ✔️ |
| Kashmiri (Arab script) | ✔️ | ✔️ |
| Kashmiri (Deva script) | ✔️ | ✔️ |
| Kazakh | ✔️ | ✔️ |
| Khmer | ✔️ | ✔️ |
| Kikuyu | ✔️ | ✔️ |
| Kinyarwanda | ✔️ | ✔️ |
| Kongo | ✔️ | ✔️ |
| Korean | ✔️ | ✔️ |
| Kyrgyz | ✔️ | ✔️ |
| Lao | ✔️ | ✔️ |
| Latgalian | ✔️ | — |
| Lingala | ✔️ | ✔️ |
| Lithuanian | ✔️ | — |
| Luxembourgish | ✔️ | — |
| Macedonian | ✔️ | ✔️ |
| Magahi | ✔️ | ✔️ |
| Maithili | ✔️ | ✔️ |
| Malayalam | ✔️ | ✔️ |
| Maltese | ✔️ | ✔️ |
| Manipuri | ✔️ | ✔️ |
| Marathi | ✔️ | ✔️ |
| Minangkabau (Arab script) | ✔️ | ✔️ |
| Minangkabau (Latn script) | ✔️ | — |
| Mizo | ✔️ | ✔️ |
| Nepali (individual language) | ✔️ | ✔️ |
| Nigerian Fulfulde | ✔️ | ✔️ |
| North Azerbaijani | ✔️ | ✔️ |
| Northern Sotho | ✔️ | ✔️ |
| Northern Uzbek | ✔️ | ✔️ |
| Norwegian Bokmål | ✔️ | ✔️ |
| Norwegian Nynorsk | ✔️ | ✔️ |
| Nyanja | ✔️ | ✔️ |
| Occitan | ✔️ | — |
| Odia (individual language) | ✔️ | ✔️ |
| Pangasinan | ✔️ | — |
| Persian (Afghanistan) | ✔️ | ✔️ |
| Polish | ✔️ | ✔️ |
| Portuguese | ✔️ | ✔️ |
| Punjabi | ✔️ | ✔️ |
| Romanian | ✔️ | ✔️ |
| Russian | ✔️ | ✔️ |
| Santali | ✔️ | ✔️ |
| Serbian | ✔️ | ✔️ |
| Sindhi | ✔️ | — |
| Sinhala | ✔️ | ✔️ |
| Slovak | ✔️ | ✔️ |
| Slovenian | ✔️ | — |
| Somali | ✔️ | — |
| South Azerbaijani | ✔️ | ✔️ |
| Southern Pashto | ✔️ | ✔️ |
| Southern Sotho | ✔️ | — |
| Spanish | ✔️ | ✔️ |
| Standard Arabic (Arab script) | ✔️ | ✔️ |
| Standard Arabic (Latn script) | ✔️ | ✔️ |
| Standard Latvian | ✔️ | ✔️ |
| Standard Malay | ✔️ | ✔️ |
| Swahili (individual language) | ✔️ | — |
| Swati | ✔️ | — |
| Swedish | ✔️ | — |
| Tajik | ✔️ | — |
| Tamil | ✔️ | ✔️ |
| Telugu | ✔️ | ✔️ |
| Thai | ✔️ | — |
| Tigrinya | ✔️ | — |
| Tosk Albanian | ✔️ | — |
| Turkish | ✔️ | ✔️ |
| Uyghur | ✔️ | — |
| Vietnamese | ✔️ | ✔️ |

## Supported models  {% id="supported-models" %}

| Model | Single speaker | Multi-speaker | Voice design | Voice replication | Voice remixing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [Gemini 3.8 Flash TTS](/docs/models/gemini-3.8-flash-tts) (`gemini-3.8-flash-tts`) | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |
| [Gemini 3.8 Flash-Lite TTS](/docs/models/gemini-3.8-flash-lite-tts) (`gemini-3.8-flash-lite-tts`) | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |
| [Gemini 3.1 Flash TTS Preview](/docs/models/gemini-3.1-flash-tts-preview) | ✔️ | ✔️ | — | — | — |
| [Gemini 2.5 Pro Preview TTS](/docs/models/gemini-2.5-pro-preview-tts) | ✔️ | ✔️ | — | — | — |

### When to use which model  {% id="when-to-use-which-model" %}

Both Gemini 3.8 TTS models share the exact same API schema and prompting format,
allowing you to switch between them with a single parameter change:

*   **Use [Gemini 3.8 Flash TTS](/docs/models/gemini-3.8-flash-tts)
    (`gemini-3.8-flash-tts`)** when maximum acoustic fidelity, nuanced acting,
    and expressive control are top priority. It is ideal for studio-grade
    creative work, complex multi-speaker dialogue, heavy vocal-burst tags,
    difficult pronunciations, regional or minority dialects, and long-form
    narrations requiring rock-solid voice and room-tone stability.
*   **Use [Gemini 3.8 Flash-Lite TTS](/docs/models/gemini-3.8-flash-lite-tts)
    (`gemini-3.8-flash-lite-tts`)** as your fast, cost-efficient workhorse
    replacement for `gemini-3.1-flash-tts-preview`. It is optimized for
    high-volume bulk production, conversational voice agent cascades, read-aloud
    features, reliable voice replication, and everyday single-speaker speech
    across major languages.

### Migration guide  {% id="migration" %}

When upgrading from earlier preview models (`gemini-3.1-flash-tts-preview` or
`gemini-2.5-pro-preview-tts`) to Gemini 3.8 TTS (`gemini-3.8-flash-tts` or
`gemini-3.8-flash-lite-tts`), review these five key changes:

1.  **Separate style from transcript:** Move sustained acting, tone, prosody,
    and pacing instructions (such as `"whispering"`, `"out of breath"`, or
    `"speaking slowly"`) out of plain text and into `speech_metadata.style`.
    Keep `text` strictly as the verbatim transcript plus inline vocal tags.
2.  **Design personas upfront with Voice design:** Replace multi-paragraph
    `"Audio Profile"` or `"Director's Notes"` blocks with a custom voice created
    in [Voice design](/docs/voice-design), then carry that `voice_...` ID
    through your TTS requests with minimal or empty `style` strings.
3.  **Use structured dialogue turns:** For multi-speaker dialogue, pass one
    `content` item per speaker turn with `speech_metadata.speaker` instead of
    embedding `Speaker: ...` prefixes inside a single text block.
4.  **Use angle brackets for inline vocal tags:** Use angle brackets (`<laugh>`,
    `<sigh>`, `<cough>`, `<breath>`, `<short pause>`) for point-in-time human
    vocalizations and pauses. Avoid non-vocal sound-effect tags (such as
    applause or thuds).
5.  **Account for default WAV (`audio/wav`) output on unary requests:** Unlike
    `gemini-3.1-flash-tts-preview` (which returned headerless raw PCM
    `audio/l16` by default), Gemini 3.8 TTS models return complete **WAV
    (`audio/wav`)** audio with a RIFF header (24 kHz, mono, 16-bit PCM) on unary
    requests. You can write decoded audio bytes directly to a `.wav` file
    without manually wrapping them with Python's `wave` module or Node's `wav`
    package. If your existing pipeline expects headerless raw PCM, mu-law, or
    A-law audio, explicitly set `response_format.mime_type` to `"audio/l16"`,
    `"audio/mulaw"`, or `"audio/alaw"` (for example, `{"response_format":
    {"type": "audio", "mime_type": "audio/l16"}}` in the Interactions API, or
    `AUDIO_L16` in `generateContent`; see
    [Audio output formats](/docs/speech-generation#audio-output-formats)).

## Prompting guide  {% id="prompting-guide" %}

Gemini 3.8 TTS models treat input text strictly as a **verbatim transcript**.
Unlike earlier preview models where stage directions were embedded in plain
text, Gemini 3.8 TTS separates sustained turn-level directions
(`speech_metadata`) from point-in-time inline vocal tags.

### Style field versus inline tags  {% id="style-vs-inline-tags" %}

Split your performance instructions by scope:

*   **Turn-level delivery (`speech_metadata.style`):** Put sustained delivery
    attributes—such as emotion, prosody, overall pace, or delivery style (like
    `"whispering"`, `"out of breath"`, `"muttering"`, or `"sarcastic"`)—into the
    `style` field of `speech_metadata`. To create a stable character and
    performance across turns, design the persona upfront in
    [Voice design](/docs/voice-design) and use `style` only for optional
    turn-level tweaks.
*   **Point-in-time events (inline tags):** Put momentary non-speech vocal
    bursts, breaths, or pauses inline inside the transcript using angle brackets
    (`<cough>`, `<breath>`, `<sigh>`, `<short pause>`). Use angle brackets
    (`<...>`) for highest audio quality, and stick to human vocalizations rather
    than non-vocal sound effects.

| Scope | Where to place | Examples |
| :--- | :--- | :--- |
| **Turn-level** (sustained across the turn) | `speech_metadata.style` | `"angry tone"`, `"speaking rapidly"`, `"out of breath"`, `"whispers"`, `"sarcastic"` |
| **Point-in-time** (occurs at a specific word) | Inline in `text` (`<...>`) | `"<cough> Thank you all for coming tonight! <throat-clearing> As I was saying..."` |

### Pacing and pauses  {% id="pacing-and-pauses" %}

You can control rhythm and silence at three levels of granularity:

*   **Punctuation and ellipses:** Use commas, dashes (`--`), and ellipses
    (`...`) for natural conversational hesitation.

*   **Inline pause tags:** Insert `<short pause>` or `<long pause>` at exact
    points in the script where a speaker should pause:

    ```text
    Hold on, let me think... <short pause> Alright, I've got it.
    ```

*   **Turn-level pace:** Set `"style": "speaking rapidly"` or `"style":
    "speaking slowly"` in `speech_metadata` to control the speaking rate across
    the whole turn.


### Prosody and pitch  {% id="prosody-and-pitch" %}

Use **`speech_metadata.style`** to control prosody, pitch, and inflection across
a turn (for example, `"style": "high pitch, cheerful and excited inflection"` or
`"style": "monotone and flat"`). If the emotion or prosody shifts mid-dialogue,
split the script into separate turns with distinct `style` values for each turn.

### Emphasis  {% id="emphasis" %}

Capitalize specific words in the transcript, combined with punctuation and
inline vocal tags, to place natural vocal stress on key words:

```text
This is a VERY important point!
It was a VERY long day <sigh> ... nobody listens anymore.
```

### Vocal bursts and non-speech sounds  {% id="vocal-bursts" %}

Place non-speech human vocalizations inline using angle brackets (`<...>`) at
the exact point where the sound should occur. Recommended vocal tags include:

{% table %}
  * `<argh>`
  * `<breath>`
  * `<heavy breath>`
  * `<exhales>`

  ---

  * `<cackle>`
  * `<cheer>`
  * `<chuckle>` / `<chuckles>`
  * `<cough>`

  ---

  * `<cry>`
  * `<gasp>`
  * `<giggle>`
  * `<groan>`

  ---

  * `<growl>`
  * `<grunt>`
  * `<grr>`
  * `<hiss>`

  ---

  * `<laugh>` / `<laughter>`
  * `<moan>`
  * `<pant>`
  * `<pff>` / `<phew>`

  ---

  * `<scream>`
  * `<shout>`
  * `<shriek>`
  * `<sigh>` / `<sighs>`

  ---

  * `<sneeze>`
  * `<snicker>`
  * `<snort>`
  * `<sob>`

  ---

  * `<throat-clearing>`
  * `<tsk>`
  * `<whimper>`
  * `<whispers>` / `<whispering>`

  ---

  * `<yawn>`
  * `<short pause>`
  * `<long pause>`
{% /table %}

{% callout type="note" %}
  If your transcript is in a non-English language,
  continue to use English inline tags for best results.

{% /callout %}

### Backchannels and overlapping speech  {% id="backchannels" %}

In multi-speaker dialogue, wrap listener reactions in pipe characters
(`|reaction|`) inside a speaker's turn to create natural backchannels or
overlapping speech without breaking into a separate turn per reaction.

*   **Short backchannel exchanges:** Layer brief listener reactions (`|oh hmm|`,
    `|oh really?|`, `|absolutely|`) inside the active speaker's turn:
    *   **Turn 1 (Speaker A):** `"So the launch is Thursday |oh hmm| Are we
        actually ready?"`
    *   **Turn 2 (Speaker B):** `"Ready enough |oh really?| The last blocker
        cleared this morning."`
    *   **Turn 3 (Speaker A):** `"Then let's ship it |absolutely| and watch the
        dashboards."`

*   **Overlapping and interleaved speech:** Use multiple pipe segments to
    simulate simultaneous or interleaved speech between two speakers (works best
    with `gemini-3.8-flash-tts`):
    *   **Simultaneous countdown/chorus:** `"Let's surprise him on three |ok|
        ready?"` followed by `"one. two. three. |happy| happy |birthday|
        birthday!"`
    *   **Full speaker overlap:** `"Hello |oh| there |my| it |goodness| must
        |gracious| be |would| almost |you| time |look| for |at that| dinner"`


### Consistency across generations and what to avoid  {% id="consistency-and-what-to-avoid" %}

Follow these guidelines to keep vocal identity stable across turns:

*   **Design personas upfront in Voice design instead of long style blocks:**
    Long-form `"Audio Profile"` paragraphs and multi-bullet `"Director's Notes"`
    carried over from earlier models are the most common cause of voice drift.
    Use that same creative intuition upfront in
    [Voice design](/docs/voice-design) to generate a persistent custom
    `voice_...` persona, then carry that voice ID through your TTS calls.
*   **Rely on the voice reference for stability (omit meta-instructions):**
    Gemini 3.8 TTS models are trained to anchor on the audio reference first. Do
    not include instructions telling the model to hold the voice steady (such as
    `"do not switch speaker identity"` or `"maintain identical timbre"`)—extra
    prompt text increases drift. Drop unnecessary style instructions and let the
    model vary naturally around the stable point provided by the voice
    reference.
*   **Do not try to change immutable speaker traits in `style`:** Avoid putting
    age, gender, names, or permanent accent changes in `speech_metadata.style`.
    Instead, pick a regional voice from the Extended Voice Library or create one
    with [Voice design](/docs/voice-design).

### Recommended workflow  {% id="recommended-workflow" %}

1.  **Build the character once:** Create your character in
    [Voice design](/docs/voice-design) or select a regional voice from the
    Extended Voice Library that matches your target language and persona.
2.  **Write natural spoken transcripts with disfluencies:** For maximum
    naturalness, write the `text` as a real spoken transcript—including natural
    conversational disfluencies and hesitations (for example, `"Oh uh yeah I
    think... hm, so that's interesting"`).
3.  **Test plain TTS first:** Synthesize your transcript with an empty `style`
    field first—most requests need no `style` instruction at all.
4.  **Add short `style` prompts only for tweaks:** Add a concise `style` string
    (such as `"casual, friendly"` or `"muttering, then reassuring"`) only for
    turns that need a specific delivery adjustment, and reuse that exact short
    string across turns when you want a consistent baseline.

### Multi-turn dialogue and voice agents  {% id="multi-turn-and-voice-agents" %}

When building real-time conversational voice agents or multi-turn applications:

*   Make **one TTS call per turn** as LLM text chunks arrive.
*   Let the configured `voice` (prebuilt, designed `voice_...`, or replicated
    `voice_...` / `voicekey_...`) carry the speaker's identity across
    turns—never re-send a long character persona on each turn.
*   Leave the per-turn `style` field empty, or send one short constant string
    (such as `"casual, friendly"`) for the whole conversation.
*   Split long agent responses into shorter turns rather than reaching for
    stronger style prompts.

## Limitations  {% id="limitations" %}

*   TTS models accept text-only inputs and generate audio-only outputs.
*   Single-request multi-speaker generation (`speech_config.speakers`) supports
    up to 2 speakers using prebuilt voices. To combine custom designed
    (`voice_...`) or replicated (`voice_...` / `voicekey_...`) voices in
    multi-character dialogue, synthesize each speaker's turn individually.
    Because unary requests return `audio/wav` with a 44-byte RIFF header by
    default, request raw PCM (`{"type": "audio", "mime_type": "audio/l16"}`) or
    strip the WAV header from each turn before concatenating the 24kHz PCM
    audio frames.
*   **Custom voice storage limits and TTL:**
    *   **Stateful voices (`store=True`, prompted or replicated):** Maximum of
        **200 voices per project** with a **1-year TTL** (time-to-live).
    *   **Stateless voice keys (`store=False`, `voicekey_...`):** **7-day TTL**
        (time-to-live).

*   Review the [Supported languages](/docs/speech-generation#languages) section
    for language coverage.

## What's next  {% id="whats-next" %}

*   Create custom vocal personas from natural language with
    [Voice design](/docs/voice-design).
*   Replicate an existing speaker's voice in
    [Voice replication](/docs/voice-replication).
*   Edit and refine prebuilt or custom voices with
    [Voice remixing](/docs/voice-remixing).
*   Compare model specifications on the
    [Gemini 3.8 Flash TTS](/docs/models/gemini-3.8-flash-tts) and
    [Gemini 3.8 Flash-Lite TTS](/docs/models/gemini-3.8-flash-lite-tts) model
    pages.
*   Explore interactive bidirectional audio with the [Live API](/docs/live-api).




> ## AI Agent Context
> - Full documentation index: https://aistudio.google.com/llms.txt
> - Gemini Docs MCP server (consistent live info): https://gemini-api-docs-mcp.dev
> - Coding agent skills & setup guide: https://aistudio.google.com/docs/coding-agents.md

# Voice design

Voice design lets you create a brand-new, persistent vocal persona from a
natural-language description using the Gemini API Voices endpoint
(`POST /v1beta/voices`). Instead of being limited to prebuilt voices or
recording reference audio, you can describe a character's age, vocal timbre,
accent, and baseline delivery, and receive a reusable `voice_...` ID saved to
your project.

The fastest way to design, audition, and iterate on custom voices is with the
interactive **Voice Design** studio in
[Google AI Studio](https://aistudio.google.com/generate-speech). You can
generate custom personas from text prompts, test them with sample scripts, and
copy the resulting `voice_...` ID directly into your application code.

{% button href="https://aistudio.google.com/generate-speech" variant="primary" %}Try in Google AI Studio{% /button %}

Both [Gemini 3.8 Flash TTS](/docs/models/gemini-3.8-flash-tts)
(`gemini-3.8-flash-tts`) and
[Gemini 3.8 Flash-Lite TTS](/docs/models/gemini-3.8-flash-lite-tts)
(`gemini-3.8-flash-lite-tts`) support Voice design.

## Create a designed voice  {% id="create-a-designed-voice" %}

Use the Google GenAI SDK (`google-genai` 2.25.0+ / `@google/genai` 2.24.0+) or REST API
to create a custom voice from a text description. For `"prompted"` voices, both
`voices.create` (`CreateVoice`) and `voices.get` (`GetVoice`) return an
output-only `sample_audio` field (`mime_type: "audio/wav"`, base64-encoded
`data`) so you can immediately audition the generated voice:

{% tabs %}
  {% tab label="Python" %}
  ```python
  import base64
  from google import genai
  
  client = genai.Client(http_options={"api_version": "v1beta"})
  
  # 1. Design a custom voice persona from natural language
  created_voice = client.voices.create(
      store=True,
      voice={
          "model": "gemini-3.8-flash-tts",
          "type": "prompted",
          "display_name": "Warm British Astronomer",
          "gender": "male",
          "language_code": "en-GB",
          "prompted": {
              "input": (
                  "A warm, thoughtful astronomer in his late 60s with a gentle"
                  " British accent, speaking with quiet wonder."
              )
          },
      },
  )
  
  print(f"Created voice ID: {created_voice.id}")
  
  # Save the generated sample_audio preview (audio/wav) returned by CreateVoice
  if created_voice.sample_audio and created_voice.sample_audio.data:
      with open("voice_preview.wav", "wb") as f:
          f.write(base64.b64decode(created_voice.sample_audio.data))
  ```

  {% /tab %}

  {% tab label="JavaScript" %}
  ```javascript
  import * as fs from "node:fs";
  import { GoogleGenAI } from "@google/genai";
  
  const ai = new GoogleGenAI({ httpOptions: { apiVersion: "v1beta" } });
  
  // 1. Design a custom voice persona from natural language
  const createdVoice = await ai.voices.create({
    store: true,
    voice: {
      model: "gemini-3.8-flash-tts",
      type: "prompted",
      display_name: "Warm British Astronomer",
      gender: "male",
      language_code: "en-GB",
      prompted: {
        input:
          "A warm, thoughtful astronomer in his late 60s with a gentle British accent, speaking with quiet wonder.",
      },
    },
  });
  
  console.log(`Created voice ID: ${createdVoice.id}`);
  
  // Save the generated sample_audio preview (audio/wav) returned by CreateVoice
  if (createdVoice.sample_audio?.data) {
    fs.writeFileSync(
      "voice_preview.wav",
      Buffer.from(createdVoice.sample_audio.data, "base64")
    );
  }
  ```

  {% /tab %}

  {% tab label="REST" %}
  ```bash
  curl "https://generativelanguage.googleapis.com/v1beta/voices" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -X POST \
    -d '{
      "store": true,
      "voice": {
        "model": "gemini-3.8-flash-tts",
        "type": "prompted",
        "display_name": "Warm British Astronomer",
        "gender": "male",
        "language_code": "en-GB",
        "prompted": {
          "input": "A warm, thoughtful astronomer in his late 60s with a gentle British accent, speaking with quiet wonder."
        }
      }
    }' | tee created_voice.json | jq -r '.sample_audio.data' | base64 --decode > voice_preview.wav
  ```

  {% /tab %}

{% /tabs %}

## How Voice design works  {% id="how-voice-design-works" %}

1.  **Create a prompted voice:** Call `voices.create` (`POST /v1beta/voices`)
    with `type="prompted"` and `store=True`.
2.  **Receive a persistent `voice_id` and `sample_audio` preview:** The API
    generates the vocal identity, stores it in your project, and returns a
    permanent ID (for example, `voice_abc123...`) along with `sample_audio`
    (`mime_type: "audio/wav"`, base64-encoded `data`) containing the generated
    preview audio for the voice.
3.  **Synthesize speech:** Pass the `voice_id` anywhere a voice name is accepted
    in your synthesis requests.

## Synthesize speech with your designed voice  {% id="synthesize-speech-with-your-designed-voice" %}

Once you have created a voice, pass its `id` (`voice_...`) to the Interactions
API to generate speech:

{% tabs %}
  {% tab label="Python" %}
  ```python
  import base64
  from google import genai
  
  client = genai.Client(http_options={"api_version": "v1beta"})
  
  interaction = client.interactions.create(
      model="gemini-3.8-flash-tts",
      input=[{
          "type": "user_input",
          "content": [{
              "type": "text",
              "text": (
                  "Look out past the rings of Saturn. Those faint photons left"
                  " their source millions of years ago."
              ),
              "annotations": [{
                  "type": "speech_metadata",
                  "style": "reflective and awe-inspired",
              }],
          }],
      }],
      response_format={"type": "audio"},
      generation_config={
          "speech_config": [
              {"voice": created_voice.id},
          ]
      },
  )
  
  with open("designed_voice.wav", "wb") as f:
      f.write(base64.b64decode(interaction.output_audio.data))
  ```

  {% /tab %}

  {% tab label="JavaScript" %}
  ```javascript
  import * as fs from "node:fs";
  import { GoogleGenAI } from "@google/genai";
  
  const ai = new GoogleGenAI({ httpOptions: { apiVersion: "v1beta" } });
  
  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash-tts",
    input: [{
      type: "user_input",
      content: [{
        type: "text",
        text: "Look out past the rings of Saturn. Those faint photons left their source millions of years ago.",
        annotations: [{
          type: "speech_metadata",
          style: "reflective and awe-inspired",
        }],
      }],
    }],
    response_format: { type: "audio" },
    generation_config: {
      speech_config: [
        { voice: createdVoice.id },
      ],
    },
  });
  
  if (interaction.output_audio?.data) {
    fs.writeFileSync("designed_voice.wav", Buffer.from(interaction.output_audio.data, "base64"));
  }
  ```

  {% /tab %}

  {% tab label="REST" %}
  ```bash
  curl "https://generativelanguage.googleapis.com/v1beta/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -X POST \
    -d '{
      "model": "gemini-3.8-flash-tts",
      "input": [{
        "type": "user_input",
        "content": [{
          "type": "text",
          "text": "Look out past the rings of Saturn. Those faint photons left their source millions of years ago.",
          "annotations": [{
            "type": "speech_metadata",
            "style": "reflective and awe-inspired"
          }]
        }]
      }],
      "response_format": {"type": "audio"},
      "generation_config": {
        "speech_config": [
          {"voice": "voice_YOUR_DESIGNED_VOICE_ID"}
        ]
      }
    }' | jq -r '[.steps[] | select(.type=="model_output") | .content[] | select(.type=="audio")] | last | .data' | base64 --decode > out.wav
  ```

  {% /tab %}

{% /tabs %}

## Manage your voices  {% id="manage-your-voices" %}

You can list, filter, inspect, and delete your stored voices at any time using
the Voices API (see
[Extended Voice Library and filtering](/docs/speech-generation#voice-library)
for all filter parameters).

*   **Storage limits and TTL:** Stateful voices (`store=True`, shared across
    prompted and replicated voices) have a limit of **200 voices per project**
    and a **1-year TTL** (time-to-live).
*   **`sample_audio` availability:** `voices.create()` (`CreateVoice`) and
    `voices.get()` (`GetVoice`) populate `sample_audio` (`mime_type:
    "audio/wav"`, base64-encoded `data`) for `"prompted"` voices. To keep
    listing lightweight, `voices.list()` (`ListVoices`) omits `sample_audio`
    (and `sample_audio` is unset for `"replicated"` and `"prebuilt"` voices).

{% tabs %}
  {% tab label="Python" %}
  ```python
  from google import genai
  
  client = genai.Client(http_options={"api_version": "v1beta"})
  
  # List stored prompted voices in your project filtered by language
  response = client.voices.list(
      type_=["prompted"],
      language_code=["en-US", "en-GB"],
  )
  for voice in response.voices or []:
      print(voice.id, voice.display_name, voice.type)
  
  # Retrieve a specific voice by ID
  voice_details = client.voices.get(id=created_voice.id)
  
  # Delete a stored custom voice
  client.voices.delete(id=created_voice.id)
  ```

  {% /tab %}

  {% tab label="JavaScript" %}
  ```javascript
  import { GoogleGenAI } from "@google/genai";
  
  const ai = new GoogleGenAI({ httpOptions: { apiVersion: "v1beta" } });
  
  // List stored prompted voices in your project filtered by language
  const response = await ai.voices.list({
    type: ["prompted"],
    language_code: ["en-US", "en-GB"],
  });
  for (const voice of response.voices ?? []) {
    console.log(voice.id, voice.display_name, voice.type);
  }
  
  // Retrieve a specific voice by ID
  const voiceDetails = await ai.voices.get(createdVoice.id);
  
  // Delete a stored custom voice
  await ai.voices.delete(createdVoice.id);
  ```

  {% /tab %}

  {% tab label="REST" %}
  ```bash
  # List stored prompted voices filtered by language
  curl -G "https://generativelanguage.googleapis.com/v1beta/voices" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    --data-urlencode "type=prompted" \
    --data-urlencode "language_code=en-US" \
    --data-urlencode "language_code=en-GB"
  
  # Retrieve a specific voice by ID
  curl "https://generativelanguage.googleapis.com/v1beta/voices/voice_YOUR_DESIGNED_VOICE_ID" \
    -H "x-goog-api-key: $GEMINI_API_KEY"
  
  # Delete a stored custom voice
  curl -X DELETE "https://generativelanguage.googleapis.com/v1beta/voices/voice_YOUR_DESIGNED_VOICE_ID" \
    -H "x-goog-api-key: $GEMINI_API_KEY"
  ```

  {% /tab %}

{% /tabs %}

## Prompting best practices for Voice design  {% id="prompting-best-practices-for-voice-design" %}

*   **Put permanent vocal traits in Voice design, not `style`:** Define
    immutable characteristics—such as age, gender, timbre, vocal texture, and
    regional accent—when creating the voice in `voices.create`.
*   **Reserve `speech_metadata.style` for situational emotion:** Once your
    custom voice is created, use short `style` prompts (for example,
    `"whispered urgently"` or `"cheerful and energetic"`) to steer turn-by-turn
    acting without altering the speaker's core identity.
*   **Be specific and concise:** A clear 1–2 sentence description (such as
    *"A crisp, energetic sports announcer in her 30s with a slight Midwestern
    accent"*) produces cleaner, more consistent results than contradictory or
    overly long paragraphs.

## What's next  {% id="whats-next" %}

*   Learn how to replicate an existing speaker's voice in
    [Voice replication](/docs/voice-replication).
*   Edit and refine prebuilt or custom voices with natural-language instructions
    in [Voice remixing](/docs/voice-remixing).
*   Explore turn-level styling, inline tags, and multi-speaker dialogue in the
    [Text-to-speech guide](/docs/speech-generation).




> ## AI Agent Context
> - Full documentation index: https://aistudio.google.com/llms.txt
> - Gemini Docs MCP server (consistent live info): https://gemini-api-docs-mcp.dev
> - Coding agent skills & setup guide: https://aistudio.google.com/docs/coding-agents.md

# Voice replication

Voice replication lets you replicate a speaker's vocal characteristics from a
short audio sample using the Gemini API Voices endpoint (`POST /v1beta/voices`).
Both [Gemini 3.8 Flash TTS](/docs/models/gemini-3.8-flash-tts)
(`gemini-3.8-flash-tts`) and
[Gemini 3.8 Flash-Lite TTS](/docs/models/gemini-3.8-flash-lite-tts)
(`gemini-3.8-flash-lite-tts`) support Voice replication.

The fastest way to replicate, verify consent, and audition a replicated voice is
with the interactive **Voice Replication** experience in
[Google AI Studio](https://aistudio.google.com/generate-speech). You can record
or upload reference and consent clips directly in the browser, preview the
voice, and copy the resulting `voice_...` ID directly into your application
code.

{% button href="https://aistudio.google.com/generate-speech" variant="primary" %}Try in Google AI Studio{% /button %}

![](https://www.gstatic.com/cloud-cms/219b34efe3e2d64e85e0645722cd0ef0.svg)

## Stateful versus stateless storage modes  {% id="storage-modes" %}

Voice replication supports two storage modes when calling `voices.create`
(`POST /v1beta/voices`), with stateful storage enabled by default:

*   **Stateful storage (`store=True`, recommended default):** Google stores your
    verified voice profile in your project and returns a lightweight, persistent
    `voice_id` (`replicated_voice.id`, such as `voice_abc123...`). You can pass
    this `voice_id` across requests and manage it with `voices.list()`,
    `voices.get()`, and `voices.delete()`.
*   **Stateless client-managed keys (`store=False`, optional):** For workloads
    requiring zero server-side persistence of biometric voice profiles, set
    `store=False`. The API returns an encrypted, self-contained `voice_key`
    (`replicated_voice.key`, starting with `voicekey_...`) that your application
    stores locally and passes directly in synthesis requests.

| Storage mode | Identifier | Project limit | Retention (TTL) |
| :--- | :--- | :--- | :--- |
| **Stateful voices** (`store=True`) | `voice_...` | **200 voices per project** (shared across prompted and replicated voices) | **1 year from last use** (sliding `expire_time`; resets on synthesis) |
| **Stateless voice keys** (`store=False`) | `voicekey_...` | Client-managed | **7 days from creation** (fixed `expire_time`; renew using `voices.create`) |

*   **Quota tier and regional availability:** Voice replication requires a
    **Paid Tier (Tier 1 or higher)** Gemini API project (see
    [Rate limits](/docs/rate-limits)); no separate allowlist is required. It is
    available in all [supported Gemini API regions](/docs/available-regions),
    including the European Economic Area (EEA/EU), the United Kingdom, and
    Switzerland.
*   **Data storage and deletion (`store=True`):** Stateful storage persists
    extracted vocal conditioning features in your project rather than the full
    raw `consent_audio` recording. Calling `voices.delete()` immediately removes
    the stored voice profile and its conditioning data from your project.
*   **Watermarking and provenance:** All synthesized audio includes an
    imperceptible
    [SynthID audio watermark](https://deepmind.google/technologies/synthid/).
    Input `source_audio` and `consent_audio` must be authentic human recordings;
    synthetic speech or audio containing existing SynthID or C2PA watermarks is
    rejected during verification.

## Audio and consent requirements  {% id="audio-and-consent-requirements" %}

Every `CreateVoice` replication request requires two real human audio recordings
from the **same adult speaker** (24kHz mono 16-bit WAV recommended):

1.  **Reference audio (`source_audio`):** A 10–30 second clip of clean, natural
    speech from the speaker whose voice you want to replicate.
2.  **Consent audio (`consent_audio`):** A recording of the same speaker clearly
    reciting the mandatory consent statement in one of the
    [supported languages](/docs/voice-replication#consent-phrases-by-language)
    (for example, in English):> *"I am the owner of this voice and I consent to Google using this voice to
    > create a synthetic voice model."*


## Create a replicated voice (stateful default)  {% id="create-a-replicated-voice" %}

Use the Google GenAI SDK (`google-genai` 2.25.0+ / `@google/genai` 2.24.0+) or REST API
with `store=True` to create and save a replicated voice profile in your project:

{% tabs %}
  {% tab label="Python" %}
  ```python
  import base64
  from google import genai
  
  client = genai.Client(http_options={"api_version": "v1beta"})
  
  with open("reference_speaker.wav", "rb") as f:
      source_b64 = base64.b64encode(f.read()).decode("utf-8")
  
  with open("speaker_consent.wav", "rb") as f:
      consent_b64 = base64.b64encode(f.read()).decode("utf-8")
  
  # Create a persistent replicated voice (store=True)
  replicated_voice = client.voices.create(
      store=True,
      voice={
          "model": "gemini-3.8-flash-tts",
          "type": "replicated",
          "display_name": "Custom Replicated Speaker",
          "replicated": {
              "source_audio": {
                  "mime_type": "audio/wav",
                  "data": source_b64,
              },
              "consent_audio": {
                  "mime_type": "audio/wav",
                  "data": consent_b64,
              },
          },
      },
  )
  
  print(f"Created voice ID: {replicated_voice.id}")
  ```

  {% /tab %}

  {% tab label="JavaScript" %}
  ```javascript
  import * as fs from "node:fs";
  import { GoogleGenAI } from "@google/genai";
  
  const ai = new GoogleGenAI({ httpOptions: { apiVersion: "v1beta" } });
  
  const sourceB64 = fs.readFileSync("reference_speaker.wav").toString("base64");
  const consentB64 = fs.readFileSync("speaker_consent.wav").toString("base64");
  
  // Create a persistent replicated voice (store: true)
  const replicatedVoice = await ai.voices.create({
    store: true,
    voice: {
      model: "gemini-3.8-flash-tts",
      type: "replicated",
      display_name: "Custom Replicated Speaker",
      replicated: {
        source_audio: {
          mime_type: "audio/wav",
          data: sourceB64,
        },
        consent_audio: {
          mime_type: "audio/wav",
          data: consentB64,
        },
      },
    },
  });
  
  console.log(`Created voice ID: ${replicatedVoice.id}`);
  ```

  {% /tab %}

  {% tab label="REST" %}
  ```bash
  SOURCE_B64=$(base64 -w 0 reference_speaker.wav)
  CONSENT_B64=$(base64 -w 0 speaker_consent.wav)
  
  curl "https://generativelanguage.googleapis.com/v1beta/voices" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -X POST \
    -d "{
      \"store\": true,
      \"voice\": {
        \"model\": \"gemini-3.8-flash-tts\",
        \"type\": \"replicated\",
        \"display_name\": \"Custom Replicated Speaker\",
        \"replicated\": {
          \"source_audio\": {
            \"mime_type\": \"audio/wav\",
            \"data\": \"$SOURCE_B64\"
          },
          \"consent_audio\": {
            \"mime_type\": \"audio/wav\",
            \"data\": \"$CONSENT_B64\"
          }
        }
      }
    }"
  ```

  {% /tab %}

{% /tabs %}

## Synthesize speech with your replicated voice  {% id="synthesize-speech-with-your-replicated-voice" %}

Pass the returned `id` (`voice_...`) in your synthesis request:

{% tabs %}
  {% tab label="Python" %}
  ```python
  import base64
  from google import genai
  
  client = genai.Client(http_options={"api_version": "v1beta"})
  
  interaction = client.interactions.create(
      model="gemini-3.8-flash-tts",
      input=[{
          "type": "user_input",
          "content": [{
              "type": "text",
              "text": (
                  "Hello! This audio was synthesized using a replicated"
                  " speaker voice."
              ),
              "annotations": [{
                  "type": "speech_metadata",
                  "style": "warm and conversational",
              }],
          }],
      }],
      response_format={"type": "audio"},
      generation_config={
          "speech_config": [
              {"voice": replicated_voice.id},
          ]
      },
  )
  
  with open("replicated_speech.wav", "wb") as f:
      f.write(base64.b64decode(interaction.output_audio.data))
  ```

  {% /tab %}

  {% tab label="JavaScript" %}
  ```javascript
  import * as fs from "node:fs";
  import { GoogleGenAI } from "@google/genai";
  
  const ai = new GoogleGenAI({ httpOptions: { apiVersion: "v1beta" } });
  
  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash-tts",
    input: [{
      type: "user_input",
      content: [{
        type: "text",
        text: "Hello! This audio was synthesized using a replicated speaker voice.",
        annotations: [{
          type: "speech_metadata",
          style: "warm and conversational",
        }],
      }],
    }],
    response_format: { type: "audio" },
    generation_config: {
      speech_config: [
        { voice: replicatedVoice.id },
      ],
    },
  });
  
  if (interaction.output_audio?.data) {
    fs.writeFileSync("replicated_speech.wav", Buffer.from(interaction.output_audio.data, "base64"));
  }
  ```

  {% /tab %}

  {% tab label="REST" %}
  ```bash
  curl "https://generativelanguage.googleapis.com/v1beta/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -X POST \
    -d '{
      "model": "gemini-3.8-flash-tts",
      "input": [{
        "type": "user_input",
        "content": [{
          "type": "text",
          "text": "Hello! This audio was synthesized using a replicated speaker voice.",
          "annotations": [{
            "type": "speech_metadata",
            "style": "warm and conversational"
          }]
        }]
      }],
      "response_format": {"type": "audio"},
      "generation_config": {
        "speech_config": [
          {"voice": "voice_YOUR_REPLICATED_VOICE_ID"}
        ]
      }
    }' | jq -r '[.steps[] | select(.type=="model_output") | .content[] | select(.type=="audio")] | last | .data' | base64 --decode > out.wav
  ```

  {% /tab %}

{% /tabs %}

## Manage stored replicated voices  {% id="manage-stored-replicated-voices" %}

When created with `store=True`, your replicated voices can be listed, filtered,
inspected, and deleted through the Voices API (see
[Extended Voice Library and filtering](/docs/speech-generation#voice-library)
for all filter parameters):

{% tabs %}
  {% tab label="Python" %}
  ```python
  from google import genai
  
  client = genai.Client(http_options={"api_version": "v1beta"})
  
  # List stored replicated voices in your project
  response = client.voices.list(type_=["replicated"])
  for voice in response.voices or []:
      print(voice.id, voice.display_name, voice.type)
  
  # Retrieve a specific voice by ID
  voice_details = client.voices.get(id=replicated_voice.id)
  
  # Delete a stored replicated voice
  client.voices.delete(id=replicated_voice.id)
  ```

  {% /tab %}

  {% tab label="JavaScript" %}
  ```javascript
  import { GoogleGenAI } from "@google/genai";
  
  const ai = new GoogleGenAI({ httpOptions: { apiVersion: "v1beta" } });
  
  // List stored replicated voices in your project
  const response = await ai.voices.list({ type: ["replicated"] });
  for (const voice of response.voices ?? []) {
    console.log(voice.id, voice.display_name, voice.type);
  }
  
  // Retrieve a specific voice by ID
  const voiceDetails = await ai.voices.get(replicatedVoice.id);
  
  // Delete a stored replicated voice
  await ai.voices.delete(replicatedVoice.id);
  ```

  {% /tab %}

  {% tab label="REST" %}
  ```bash
  # List stored replicated voices in your project
  curl -G "https://generativelanguage.googleapis.com/v1beta/voices" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    --data-urlencode "type=replicated"
  
  # Retrieve a specific voice by ID
  curl "https://generativelanguage.googleapis.com/v1beta/voices/voice_YOUR_REPLICATED_VOICE_ID" \
    -H "x-goog-api-key: $GEMINI_API_KEY"
  
  # Delete a stored replicated voice
  curl -X DELETE "https://generativelanguage.googleapis.com/v1beta/voices/voice_YOUR_REPLICATED_VOICE_ID" \
    -H "x-goog-api-key: $GEMINI_API_KEY"
  ```

  {% /tab %}

{% /tabs %}

## Option: Stateless client-managed voice keys (`store=False`)  {% id="stateless-client-managed-keys" %}

If your application requires zero server-side persistence of voice profiles, set
`store=False` when creating the replicated voice. The API returns an encrypted
`voice_key` (`replicated_voice.key`, starting with `voicekey_...`) bound to your
project, along with its `expire_time`, that you store client-side and pass
directly anywhere a `voice` ID is accepted.

*   **7-day key expiration and renewal:** Stateless `voicekey_...` tokens have a
    fixed **7-day** lifetime from creation (`replicated_voice.expire_time`);
    using an expired key in synthesis returns `400 INVALID_ARGUMENT`. To renew a
    stateless key before or after it expires, call `voices.create`
    (`POST /v1beta/voices`) again with `store=False` using the **same stored
    `source_audio` and `consent_audio` recordings**—the speaker does not need to
    record new audio. The service re-verifies the recordings and returns a new
    `voicekey_...` with a fresh 7-day `expire_time`.

{% tabs %}
  {% tab label="Python" %}
  ```python
  import base64
  from google import genai
  
  client = genai.Client(http_options={"api_version": "v1beta"})
  
  with open("reference_speaker.wav", "rb") as f:
      source_b64 = base64.b64encode(f.read()).decode("utf-8")
  
  with open("speaker_consent.wav", "rb") as f:
      consent_b64 = base64.b64encode(f.read()).decode("utf-8")
  
  # Create a stateless client-managed voice key (store=False)
  replicated_voice = client.voices.create(
      store=False,
      voice={
          "model": "gemini-3.8-flash-tts",
          "type": "replicated",
          "replicated": {
              "source_audio": {"mime_type": "audio/wav", "data": source_b64},
              "consent_audio": {"mime_type": "audio/wav", "data": consent_b64},
          },
      },
  )
  
  # Pass replicated_voice.key ("voicekey_...") directly as the speaker voice
  interaction = client.interactions.create(
      model="gemini-3.8-flash-tts",
      input=[{
          "type": "user_input",
          "content": [{
              "type": "text",
              "text": "Hello! This audio uses a stateless client-managed voice key.",
              "annotations": [{
                  "type": "speech_metadata",
                  "style": "warm and conversational",
              }],
          }],
      }],
      response_format={"type": "audio"},
      generation_config={
          "speech_config": [
              {"voice": replicated_voice.key},
          ]
      },
  )
  ```

  {% /tab %}

  {% tab label="JavaScript" %}
  ```javascript
  import * as fs from "node:fs";
  import { GoogleGenAI } from "@google/genai";
  
  const ai = new GoogleGenAI({ httpOptions: { apiVersion: "v1beta" } });
  
  const sourceB64 = fs.readFileSync("reference_speaker.wav").toString("base64");
  const consentB64 = fs.readFileSync("speaker_consent.wav").toString("base64");
  
  // Create a stateless client-managed voice key (store: false)
  const replicatedVoice = await ai.voices.create({
    store: false,
    voice: {
      model: "gemini-3.8-flash-tts",
      type: "replicated",
      replicated: {
        source_audio: { mime_type: "audio/wav", data: sourceB64 },
        consent_audio: { mime_type: "audio/wav", data: consentB64 },
      },
    },
  });
  
  // Pass replicatedVoice.key ("voicekey_...") directly as the speaker voice
  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash-tts",
    input: [{
      type: "user_input",
      content: [{
        type: "text",
        text: "Hello! This audio uses a stateless client-managed voice key.",
        annotations: [{
          type: "speech_metadata",
          style: "warm and conversational",
        }],
      }],
    }],
    response_format: { type: "audio" },
    generation_config: {
      speech_config: [
        { voice: replicatedVoice.key },
      ],
    },
  });
  ```

  {% /tab %}

  {% tab label="REST" %}
  ```bash
  SOURCE_B64=$(base64 -w 0 reference_speaker.wav)
  CONSENT_B64=$(base64 -w 0 speaker_consent.wav)
  
  curl "https://generativelanguage.googleapis.com/v1beta/voices" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -X POST \
    -d "{
      \"store\": false,
      \"voice\": {
        \"model\": \"gemini-3.8-flash-tts\",
        \"type\": \"replicated\",
        \"replicated\": {
          \"source_audio\": {\"mime_type\": \"audio/wav\", \"data\": \"$SOURCE_B64\"},
          \"consent_audio\": {\"mime_type\": \"audio/wav\", \"data\": \"$CONSENT_B64\"}
        }
      }
    }"
  ```

  {% /tab %}

{% /tabs %}

## Supported consent phrases by language  {% id="consent-phrases-by-language" %}

The consent audio must clearly recite the exact statement in one of the 30 supported language locales:

| Language | Locale (`lang_id`) | Verbatim Consent Statement |
| :--- | :--- | :--- |
| **Arabic** | `ar-XA` | أنا مالك هذا الصوت وأوافق على أن تستخدم Google هذا الصوت لإنشاء نموذج صوتي اصطناعي. |
| **Bengali** | `bn-IN` | আমি এই ভয়েসের মালিক এবং আমি একটি সিন্থেটিক ভয়েস মডেল তৈরি করতে এই ভয়েস ব্যবহার করে Google-এর সাথে সম্মতি দিচ্ছি। |
| **Chinese (Simplified)** | `zh-CN` | 我是此声音的拥有者并授权谷歌使用此声音创建语音合成模型 |
| **Dutch** | `nl-NL` | Ik ben de eigenaar van deze stem en ik geef Google toestemming om deze stem te gebruiken om een synthetisch stemmodel te maken. |
| **English (US)** | `en-US` | I am the owner of this voice and I consent to Google using this voice to create a synthetic voice model. |
| **English (UK)** | `en-GB` | I am the owner of this voice and I consent to Google using this voice to create a synthetic voice model. |
| **English (India)** | `en-IN` | I am the owner of this voice and I consent to Google using this voice to create a synthetic voice model. |
| **English (Australia)** | `en-AU` | I am the owner of this voice and I consent to Google using this voice to create a synthetic voice model. |
| **French (France)** | `fr-FR` | Je suis le propriétaire de cette voix et j'autorise Google à utiliser cette voix pour créer un modèle de voix synthétique. |
| **French (Canada)** | `fr-CA` | Je suis le propriétaire de cette voix et j'autorise Google à utiliser cette voix pour créer un modèle de voix synthétique. |
| **German** | `de-DE` | Ich bin der Eigentümer dieser Stimme und bin damit einverstanden, dass Google diese Stimme zur Erstellung eines synthetischen Stimmmodells verwendet. |
| **Gujarati** | `gu-IN` | હું આ વોઈસનો માલિક છું અને સિન્થેટિક વોઈસ મોડલ બનાવવા માટે આ વોઈસનો ઉપયોગ કરીને google ને હું સંમતિ આપું છું |
| **Hindi** | `hi-IN` | मैं इस आवाज का मालिक हूं और मैं सिंथेटिक आवाज मॉडल बनाने के लिए Google को इस आवाज का उपयोग करने की सहमति देता हूं |
| **Indonesian** | `id-ID` | Saya pemilik suara ini dan saya menyetujui Google menggunakan suara ini untuk membuat model suara sintetis. |
| **Italian** | `it-IT` | Sono il proprietario di questa voce e acconsento che Google la utilizzi per creare un modello di voce sintetica. |
| **Japanese** | `ja-JP` | 私はこの音声の所有者であり、Googleがこの音声を使用して音声合成モデルを作成することを承認します。 |
| **Kannada** | `kn-IN` | ನಾನು ಈ ಧ್ವನಿಯ ಮಾಲಿಕ ಮತ್ತು ಸಂಶ್ಲೇಷಿತ ಧ್ವನಿ ಮಾದರಿಯನ್ನು ರಚಿಸಲು ಈ ಧ್ವನಿಯನ್ನು ಬಳಸಿಕೊಂಡುಗೂಗಲ್ ಗೆ ನಾನು ಸಮ್ಮತಿಸುತ್ತೇನೆ. |
| **Korean** | `ko-KR` | 나는 이 음성의 소유자이며 구글이 이 음성을 사용하여 음성 합성 모델을 생성할 것을 허용합니다. |
| **Malayalam** | `ml-IN` | ഈ ശബ്ദത്തിന്റെ ഉടമ ഞാനാണ്, ഒരു സിന്തറ്റിക് വോയ്സ് മോഡൽ സൃഷ്ടിക്കാൻ ഈ ശബ്ദം ഉപയോഗിക്കുന്നതിന് ഞാൻ Google-ന് സമ്മതം നൽകുന്നു. |
| **Marathi** | `mr-IN` | मी या आवाजाचा मालक आहे आणि सिंथेटिक व्हॉइस मॉडेल तयार करण्यासाठी हा आवाज वापरण्यासाठी मी Google ला संमती देतो |
| **Polish** | `pl-PL` | Jestem właścicielem tego głosu i wyrażam zgodę na wykorzystanie go przez Google w celu utworzenia syntetycznego modelu głosu. |
| **Portuguese (Brazil)** | `pt-BR` | Eu sou o proprietário desta voz e autorizo o Google a usá-la para criar um modelo de voz sintética. |
| **Russian** | `ru-RU` | Я являюсь владельцем этого голоса и даю согласие Google на использование этого голоса для создания модели синтетического голоса. |
| **Spanish (Spain)** | `es-ES` | Soy el propietario de esta voz y doy mi consentimiento para que Google la utilice para crear un modelo de voz sintética. |
| **Spanish (US)** | `es-US` | Soy el propietario de esta voz y doy mi consentimiento para que Google la utilice para crear un modelo de voz sintética. |
| **Tamil** | `ta-IN` | நான் இந்த குரலின் உரிமையாளர் மற்றும் செயற்கை குரல் மாதிரியை உருவாக்க இந்த குரலை பயன்படுத்த குகல்க்கு நான் ஒப்புக்கொள்கிறேன். |
| **Telugu** | `te-IN` | నేను ఈ వాయిస్ యజమానిని మరియు సింతటిక్ వాయిస్ మోడల్ ని రూపొందించడానికి ఈ వాయిస్ ని ఉపయోగించడానికి googleకి నేను సమ్మతిస్తున్నాను. |
| **Thai** | `th-TH` | ฉันเป็นเจ้าของเสียงนี้ และฉันยินยอมให้ Google ใช้เสียงนี้เพื่อสร้างแบบจำลองเสียงสังเคราะห์ |
| **Turkish** | `tr-TR` | Bu sesin sahibi benim ve Google'ın bu sesi kullanarak sentetik bir ses modeli oluşturmasına izin veriyorum. |
| **Vietnamese** | `vi-VN` | Tôi là chủ sở hữu giọng nói này và tôi đồng ý cho Google sử dụng giọng nói này để tạo mô hình giọng nói tổng hợp. |

## Best practices for recording reference audio  {% id="best-practices" %}

*   **Record in a quiet environment:** Minimize room echo, background noise,
    music, and overlapping voices.
*   **Match recording conditions:** Record both `source_audio` and
    `consent_audio` on the same microphone in the same acoustic setting so the
    speaker verification check succeeds reliably.
*   **Convert to 24kHz mono WAV:** For best results, resample input audio to
    24kHz mono 16-bit PCM WAV before encoding.

## What's next  {% id="whats-next" %}

*   Learn how to create custom personas from text descriptions in
    [Voice design](/docs/voice-design).
*   Edit and refine prebuilt or designed voices in
    [Voice remixing](/docs/voice-remixing).
*   Explore turn-level styling, inline tags, and multi-speaker dialogue in the
    [Text-to-speech guide](/docs/speech-generation).



> ## AI Agent Context
> - Full documentation index: https://aistudio.google.com/llms.txt
> - Gemini Docs MCP server (consistent live info): https://gemini-api-docs-mcp.dev
> - Coding agent skills & setup guide: https://aistudio.google.com/docs/coding-agents.md

# Voice remixing

Voice remixing lets you modify an existing voice using natural-language
instructions to create a new, independent stored voice.

To implement, use `POST /v1beta/voices` with `gemini-3.8-flash-tts` to generate
a new `voice_...` ID. You can then use this ID to synthesize speech with both
[Gemini 3.8 Flash TTS](/docs/models/gemini-3.8-flash-tts)
(`gemini-3.8-flash-tts`) and
[Gemini 3.8 Flash-Lite TTS](/docs/models/gemini-3.8-flash-lite-tts)
(`gemini-3.8-flash-lite-tts`).

Instead of designing a vocal persona from scratch, you provide a `base_voice`—such
as a prebuilt studio voice, an
[Extended Voice Library](/docs/speech-generation#voice-library) voice, or a
custom [Voice design](/docs/voice-design) persona—along with a relative prompt
in `input` describing the changes to make (such as shifting age, pitch, energy,
timbre, or accent). You can remix voices interactively in
[Google AI Studio](https://aistudio.google.com/generate-speech) or
programmatically using `POST /v1beta/voices`.

{% button href="https://aistudio.google.com/generate-speech" variant="primary" %}Try in Google AI Studio{% /button %}

## Get started  {% id="get-started" %}

The following example remixes the prebuilt `"Puck"` voice into a new stored
voice (`voice_...`), saves the generated `sample_audio` WAV preview, and
synthesizes speech with the remixed voice:

{% tabs %}
  {% tab label="Python" %}
  ```python
  import base64
  from google import genai
  
  client = genai.Client(http_options={"api_version": "v1beta"})
  
  # 1. Remix an existing base voice into a new stored custom voice
  remixed_voice = client.voices.create(
      store=True,
      voice={
          "model": "gemini-3.8-flash-tts",
          "type": "prompted",
          "prompted": {
              "base_voice": "Puck",
              "input": (
                  "Make the voice sound slightly older and more grounded, with a"
                  " warm British accent and measured audiobook narration pacing."
              ),
          },
      },
  )
  
  print(f"Created remixed voice ID: {remixed_voice.id}")  # e.g., "voice_abc123..."
  
  # Optional: Save the sample audio preview (24kHz WAV) returned by CreateVoice
  if remixed_voice.sample_audio and remixed_voice.sample_audio.data:
      with open("remixed_voice_preview.wav", "wb") as f:
          f.write(base64.b64decode(remixed_voice.sample_audio.data))
  
  # 2. Synthesize speech using the remixed voice ID
  interaction = client.interactions.create(
      model="gemini-3.8-flash-tts",
      input=[{
          "type": "user_input",
          "content": [{
              "type": "text",
              "text": "Chapter One. The fog rolled quietly across the harbor at dawn.",
              "annotations": [{
                  "type": "speech_metadata",
                  "style": "calm and reflective",
              }],
          }],
      }],
      response_format={"type": "audio"},
      generation_config={
          "speech_config": [
              {"voice": remixed_voice.id},
          ]
      },
  )
  
  with open("remixed_voice_output.wav", "wb") as f:
      f.write(base64.b64decode(interaction.output_audio.data))
  ```

  {% /tab %}

  {% tab label="JavaScript" %}
  ```javascript
  import { GoogleGenAI } from "@google/genai";
  import * as fs from "node:fs";
  
  const client = new GoogleGenAI({ httpOptions: { apiVersion: "v1beta" } });
  
  // 1. Remix an existing base voice into a new stored custom voice
  const remixedVoice = await client.voices.create({
    store: true,
    voice: {
      model: "gemini-3.8-flash-tts",
      type: "prompted",
      prompted: {
        base_voice: "Puck",
        input:
          "Make the voice sound slightly older and more grounded, with a warm British accent and measured audiobook narration pacing.",
      },
    },
  });
  
  console.log(`Created remixed voice ID: ${remixedVoice.id}`); // e.g., "voice_abc123..."
  
  // Optional: Save the sample audio preview (24kHz WAV) returned by CreateVoice
  if (remixedVoice.sample_audio?.data) {
    fs.writeFileSync(
      "remixed_voice_preview.wav",
      Buffer.from(remixedVoice.sample_audio.data, "base64")
    );
  }
  
  // 2. Synthesize speech using the remixed voice ID
  const interaction = await client.interactions.create({
    model: "gemini-3.8-flash-tts",
    input: [{
      type: "user_input",
      content: [{
        type: "text",
        text: "Chapter One. The fog rolled quietly across the harbor at dawn.",
        annotations: [{
          type: "speech_metadata",
          style: "calm and reflective",
        }],
      }],
    }],
    response_format: { type: "audio" },
    generation_config: {
      speech_config: [
        { voice: remixedVoice.id },
      ],
    },
  });
  
  const audioBuffer = Buffer.from(interaction.output_audio.data, "base64");
  fs.writeFileSync("remixed_voice_output.wav", audioBuffer);
  ```

  {% /tab %}

  {% tab label="REST" %}
  ```bash
  # 1. Remix an existing base voice into a new stored custom voice
  curl -X POST "https://generativelanguage.googleapis.com/v1beta/voices" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "store": true,
      "voice": {
        "model": "gemini-3.8-flash-tts",
        "type": "prompted",
        "prompted": {
          "base_voice": "Puck",
          "input": "Make the voice sound slightly older and more grounded, with a warm British accent and measured audiobook narration pacing."
        }
      }
    }'
  
  # The response returns "id": "voice_abc123...", "prompted": {"base_voice": "Puck", ...},
  # and "sample_audio": {"mime_type": "audio/wav", "data": "<base64-wav>"}
  
  # 2. Synthesize speech using the returned voice_... ID
  curl -X POST "https://generativelanguage.googleapis.com/v1beta/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gemini-3.8-flash-tts",
      "input": [{
        "type": "user_input",
        "content": [{
          "type": "text",
          "text": "Chapter One. The fog rolled quietly across the harbor at dawn.",
          "annotations": [{
            "type": "speech_metadata",
            "style": "calm and reflective"
          }]
        }]
      }],
      "response_format": {
        "type": "audio"
      },
      "generation_config": {
        "speech_config": [
          { "voice": "voice_abc123..." }
        ]
      }
    }' | jq -r '[.steps[] | select(.type=="model_output") | .content[] | select(.type=="audio")] | last | .data' | base64 --decode > remixed_voice_output.wav
  ```

  {% /tab %}

{% /tabs %}

## How Voice remixing works  {% id="how-voice-remixing-works" %}

Voice remixing uses the same `POST /v1beta/voices` endpoint (`type="prompted"`,
`store=True`) as [Voice design](/docs/voice-design), adding the
`prompted.base_voice` field to anchor generation on an existing voice:

1.  **Select a base voice and describe relative edits:** Call
    `client.voices.create()` (`POST /v1beta/voices`) with `type="prompted"`,
    `store=True`, `prompted.base_voice` set to an existing voice name or ID, and
    `prompted.input` describing how to modify that voice.
2.  **Generate and store a new independent voice (`voice_...`):** The model
    applies your relative instructions to the acoustic profile of `base_voice`,
    stores a new custom voice resource in your project without mutating the
    original `base_voice`, and returns its `id` (`voice_...`) along with a
    24kHz WAV `sample_audio` preview (`mime_type: "audio/wav"`).
3.  **Synthesize speech or iterate further:** Pass the new `voice_...` ID in
    `speech_config` for single-speaker synthesis, or pass it as `base_voice` in
    subsequent `CreateVoice` calls to refine the voice step by step.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `store` | `bool` | Required (`True` for `"prompted"` voices). Stores the remixed voice in your project and returns a `voice_...` ID. |
| `voice.model` | `str` | Optional. Voice creation model: `"gemini-3.8-flash-tts"` (default when omitted). The resulting stored `voice_...` ID can be used for speech synthesis with both `gemini-3.8-flash-tts` and `gemini-3.8-flash-lite-tts`. |
| `voice.type` | `str` | Required. Set to `"prompted"`. |
| `voice.prompted.base_voice` | `str` | Required for remixing. Name or ID of the source voice to remix (prebuilt voice name, Extended Voice Library ID, or stored prompted `voice_...` ID). |
| `voice.prompted.input` | `str` | Required. Natural-language instructions describing the relative modifications to apply to `base_voice`. |

## Supported base voices  {% id="supported-base-voices" %}

You can pass any of the following voice identifiers in `prompted.base_voice`:

*   **Prebuilt and Extended Voice Library voices:** Pass any of the 30 prebuilt
    studio voice names (such as `"Puck"`, `"Kore"`, or `"Zephyr"`) or any
    catalog voice ID returned by `client.voices.list()` (`GET /v1beta/voices`).
*   **Designed or previously remixed voices (`voice_...`):** Pass the `id` of
    any stored `"prompted"` voice owned by your project to fine-tune a custom
    persona without regenerating it from scratch.

{% callout type="note" %}
  Remixing always creates a new, standalone `voice_...` resource. It never
  modifies or overwrites the original `base_voice`, and deleting the `base_voice`
  later does not affect any voices remixed from it.

{% /callout %}

## Iterative remixing across custom voices  {% id="iterative-remixing" %}

Because every remixed voice is itself a stored `voice_...` resource, you can
chain remixes across custom voices—starting from a designed or previously
remixed voice and refining specific vocal traits step by step:

{% tabs %}
  {% tab label="Python" %}
  ```python
  from google import genai
  
  client = genai.Client(http_options={"api_version": "v1beta"})
  
  # Start from an existing prompted voice ID (designed or previously remixed)
  source_voice_id = "voice_abc123..."
  
  # Create a new variation while preserving the core vocal identity
  remixed_variation = client.voices.create(
      store=True,
      voice={
          "model": "gemini-3.8-flash-tts",
          "type": "prompted",
          "prompted": {
              "base_voice": source_voice_id,
              "input": (
                  "Keep the same speaker identity and accent, but make the"
                  " delivery calmer, softer, and slightly lower in pitch."
              ),
          },
      },
  )
  
  print(f"New voice ID: {remixed_variation.id}")
  print(f"Remixed from: {remixed_variation.prompted.base_voice}")
  ```

  {% /tab %}

  {% tab label="JavaScript" %}
  ```javascript
  import { GoogleGenAI } from "@google/genai";
  
  const client = new GoogleGenAI({ httpOptions: { apiVersion: "v1beta" } });
  
  // Start from an existing prompted voice ID (designed or previously remixed)
  const sourceVoiceId = "voice_abc123...";
  
  // Create a new variation while preserving the core vocal identity
  const remixedVariation = await client.voices.create({
    store: true,
    voice: {
      model: "gemini-3.8-flash-tts",
      type: "prompted",
      prompted: {
        base_voice: sourceVoiceId,
        input:
          "Keep the same speaker identity and accent, but make the delivery calmer, softer, and slightly lower in pitch.",
      },
    },
  });
  
  console.log(`New voice ID: ${remixedVariation.id}`);
  console.log(`Remixed from: ${remixedVariation.prompted?.base_voice}`);
  ```

  {% /tab %}

  {% tab label="REST" %}
  ```bash
  curl -X POST "https://generativelanguage.googleapis.com/v1beta/voices" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "store": true,
      "voice": {
        "model": "gemini-3.8-flash-tts",
        "type": "prompted",
        "prompted": {
          "base_voice": "voice_abc123...",
          "input": "Keep the same speaker identity and accent, but make the delivery calmer, softer, and slightly lower in pitch."
        }
      }
    }'
  ```

  {% /tab %}

{% /tabs %}

## Manage and inspect remixed voices  {% id="manage-remixed-voices" %}

Remixed voices are stored in your project with `type="prompted"`. When you
retrieve or list custom voices, remixed voices include both
`voice.prompted.base_voice` and `voice.prompted.input` so you can track lineage
across your voice library. Calling `GetVoice` also returns `sample_audio`
(`audio/wav`) so you can replay the preview audio at any time.

*   **Quota tier requirement:** Voice remixing requires a **Paid Tier (Tier 1 or
    higher)** Gemini API project (see [Rate limits](/docs/rate-limits)).
*   **Project quota:** Up to **200 stateful voices (`store=True`) per project**,
    shared across designed, remixed, and stored replicated voices.
*   **Retention (TTL):** **1 year from last use (`expire_time`)**. Each time you
    synthesize speech with a stored voice or reference it as `base_voice` in a
    new remix request, its 1-year expiration window resets automatically.

{% tabs %}
  {% tab label="Python" %}
  ```python
  import base64
  from google import genai
  
  client = genai.Client(http_options={"api_version": "v1beta"})
  
  # List all custom prompted voices (both designed and remixed)
  response = client.voices.list(type_=["prompted"])
  for v in response.voices or []:
      base = v.prompted.base_voice if v.prompted else None
      prompt = v.prompted.input if v.prompted else None
      print(f"{v.id} | base_voice={base} | expires={v.expire_time} | prompt={prompt}")
  
  # Retrieve a specific remixed voice (including its sample_audio WAV preview)
  voice_info = client.voices.get(id="voice_abc123...")
  if voice_info.sample_audio and voice_info.sample_audio.data:
      with open("fetched_remix_preview.wav", "wb") as f:
          f.write(base64.b64decode(voice_info.sample_audio.data))
  
  # Delete a remixed voice when no longer needed
  client.voices.delete(id="voice_abc123...")
  ```

  {% /tab %}

  {% tab label="JavaScript" %}
  ```javascript
  import { GoogleGenAI } from "@google/genai";
  import * as fs from "node:fs";
  
  const client = new GoogleGenAI({ httpOptions: { apiVersion: "v1beta" } });
  
  // List all custom prompted voices (both designed and remixed)
  const response = await client.voices.list({ type: ["prompted"] });
  for (const v of response.voices ?? []) {
    console.log(
      `${v.id} | base_voice=${v.prompted?.base_voice ?? "none"} | expires=${v.expire_time} | prompt=${v.prompted?.input}`
    );
  }
  
  // Retrieve a specific remixed voice (including its sample_audio WAV preview)
  const voiceInfo = await client.voices.get("voice_abc123...");
  if (voiceInfo.sample_audio?.data) {
    fs.writeFileSync(
      "fetched_remix_preview.wav",
      Buffer.from(voiceInfo.sample_audio.data, "base64")
    );
  }
  
  // Delete a remixed voice when no longer needed
  await client.voices.delete("voice_abc123...");
  ```

  {% /tab %}

  {% tab label="REST" %}
  ```bash
  # List all custom prompted voices (both designed and remixed)
  curl -G "https://generativelanguage.googleapis.com/v1beta/voices" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    --data-urlencode "type=prompted"
  
  # Get metadata and sample_audio preview for a specific remixed voice
  curl "https://generativelanguage.googleapis.com/v1beta/voices/voice_abc123..." \
    -H "x-goog-api-key: $GEMINI_API_KEY"
  
  # Delete a remixed voice
  curl -X DELETE "https://generativelanguage.googleapis.com/v1beta/voices/voice_abc123..." \
    -H "x-goog-api-key: $GEMINI_API_KEY"
  ```

  {% /tab %}

{% /tabs %}

## Prompting best practices for Voice remixing  {% id="prompting-best-practices" %}

*   **Describe relative adjustments instead of repeating the full persona:**
    Because the model anchors on the acoustic profile of `base_voice`, focus
    `prompted.input` on the specific traits you want to change—such as age,
    timbre, pitch, pacing, or vocal energy.
*   **Rely on default language and accent preservation:** Relative remix prompts
    preserve the baseline language and regional accent of the `base_voice`
    unless you explicitly specify a new language or accent in `prompted.input`.
*   **Modify one or two traits per step when chaining remixes:** When refining a
    voice across multiple iterations, adjust a focused set of attributes per
    call and audition the `sample_audio` preview before chaining the next edit.
*   **Use Voice remixing for permanent vocal traits and `speech_metadata.style`
    for turn-level acting:** Use Voice remixing to permanently shift a
    character's baseline voice (such as age, accent, pitch, or default persona).
    Use `speech_metadata.style` during TTS synthesis for temporary, turn-by-turn
    delivery cues (such as `"whispering"` or `"excited"`).

| Remix goal | Example `base_voice` | Example `prompted.input` |
| :--- | :--- | :--- |
| **Age and timbre shift** | `"Puck"` | `"Make the voice sound 20 years older with a deeper, slightly gravelly baritone timbre while keeping the friendly warmth."` |
| **Regional accent adaptation** | `"Kore"` | `"Change the accent to Australian English while preserving the clear, confident studio delivery."` |
| **Domain and pacing adjustment** | `"voice_abc123..."` (designed voice) | `"Adapt this voice for late-night meditation narration: lower the vocal projection, slow the pacing, and soften the tone."` |
| **Energy and projection shift** | `"voice_def456..."` (remixed voice) | `"Increase vocal energy and projection so the speaker sounds like an upbeat live event announcer."` |

## What's next  {% id="whats-next" %}

*   Create custom vocal personas from scratch in
    [Voice design](/docs/voice-design).
*   Replicate a speaker's voice from reference audio in
    [Voice replication](/docs/voice-replication).
*   Explore turn-level styling, inline vocal tags, and multi-speaker dialogue in
    the [Text-to-speech guide](/docs/speech-generation).
*   Compare model specifications on the
    [Gemini 3.8 Flash TTS](/docs/models/gemini-3.8-flash-tts) and
    [Gemini 3.8 Flash-Lite TTS](/docs/models/gemini-3.8-flash-lite-tts) model
    pages.


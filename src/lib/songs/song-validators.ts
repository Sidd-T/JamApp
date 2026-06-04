import { z } from 'zod';

// Chord segments in a section
const ChordSegmentSchema = z.object({
  Chords: z.string().min(1, 'Chords cannot be empty'),
});

// Section with optional parts
const SectionSchema = z.object({
  Label: z.string().optional(),
  Repeat: z.number().int().positive().optional(),
  MainSegment: ChordSegmentSchema.optional(),
  Endings: z.array(ChordSegmentSchema).optional(),
});

// Core song validation schema for creating/updating
export const CreateSongSchema = z.object({
  Title: z.string().min(1, 'Title is required').trim(),
  Composer: z.string().min(1, 'Composer is required').trim(),
  Key: z.string().min(1, 'Key is required').trim(),
  Rhythm: z.string().min(1, 'Rhythm is required').trim(),
  TimeSignature: z.string().min(1, 'Time Signature is required').trim(),
  Sections: z.array(SectionSchema).optional().default([]),
});

export type CreateSongInput = z.infer<typeof CreateSongSchema>;

// Full song with ID (after creation)
export const SongSchema = CreateSongSchema.extend({
  id: z.uuid('Invalid song ID'),
});

export type ValidatedSong = z.infer<typeof SongSchema>;

// Type for update operations (all fields optional)
export const UpdateSongSchema = CreateSongSchema.partial();
export type UpdateSongInput = z.infer<typeof UpdateSongSchema>;

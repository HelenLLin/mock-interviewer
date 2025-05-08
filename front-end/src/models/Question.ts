import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestion extends Document {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  examples: any[];
  constraints: string[];
  starting_code: string;
  solutions?: any[];
  test_cases?: any[];
  createdAt?: Date;
}

const QuestionSchema: Schema<IQuestion> = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide a title for this question.'],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description.'],
  },
  difficulty: {
    type: String,
    required: [true, 'Please provide a difficulty.'],
    enum: ['Easy', 'Medium', 'Hard'],
  },
  examples: {
    type: Array,
    default: [],
  },
  constraints: {
    type: [String],
    default: [],
  },
  starting_code: {
    type: String,
    required: [true, 'Please provide starting code.'],
  },
  solutions: {
    type: Array,
    default: [],
  },
  test_cases: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'coding_questions',
  timestamps: { createdAt: 'createdAt', updatedAt: false }
});

const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

export default Question;
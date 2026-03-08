export type Note = {
    _id?: string;
    id?: string;
    title: string;
    subject: string;
    category: string;
    downloadUrl: string;
    date: string;
    description: string;
    fileKey?: string;
};

// Categories will now be derived dynamically from the data

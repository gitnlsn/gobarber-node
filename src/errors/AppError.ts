class AppError extends Error {
    public readonly name: string;

    public readonly message: string;

    public readonly statusCode: number;

    constructor(message: string, statusCode = 400) {
        super(message);
        this.name = 'AppError';
        this.message = message;
        this.statusCode = statusCode;
    }
}

export default AppError;

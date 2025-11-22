import api, { PaginatedResponse } from '../api';
import type {
  Book,
  CreateBookRequest,
  UpdateBookRequest,
  BookFilters,
  Author,
  Category,
} from '../types';

class BooksService {
  // Get all books with pagination and filters
  async getBooks(filters?: BookFilters): Promise<PaginatedResponse<Book>> {
    const params = new URLSearchParams();

    // Convert page/size to skip/limit format expected by backend
    if (filters?.page && filters?.size) {
      const skip = (filters.page - 1) * filters.size;
      params.append('skip', skip.toString());
      params.append('limit', filters.size.toString());
    } else if (filters?.size) {
      params.append('skip', '0');
      params.append('limit', filters.size.toString());
    }

    if (filters?.search) params.append('q', filters.search);
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());
    if (filters?.min_price) params.append('min_price', filters.min_price.toString());
    if (filters?.max_price) params.append('max_price', filters.max_price.toString());
    if (filters?.in_stock !== undefined) params.append('in_stock', filters.in_stock.toString());
    if (filters?.format) params.append('format', filters.format);

    const queryString = params.toString();
    const url = queryString ? `/books?${queryString}` : '/books';

    // Backend returns array, need to convert to paginated format
    const booksArray = await api.get<Book[]>(url);

    // Convert to expected paginated format
    return {
      items: booksArray,
      total: booksArray.length, // This is incomplete but works for now
      page: filters?.page || 1,
      size: filters?.size || 20,
      pages: Math.ceil(booksArray.length / (filters?.size || 20)),
    };
  }

  // Get book by ID
  async getBookById(id: number): Promise<Book> {
    const response = await api.get<Book>(`/books/${id}`);
    return response;
  }

  // Create new book
  async createBook(bookData: CreateBookRequest): Promise<Book> {
    const response = await api.post<Book>('/books', bookData);
    return response;
  }

  // Update book
  async updateBook(id: number, bookData: UpdateBookRequest): Promise<Book> {
    const response = await api.put<Book>(`/books/${id}`, bookData);
    return response;
  }

  // Delete book
  async deleteBook(id: number): Promise<void> {
    await api.delete(`/books/${id}`);
  }

  // Search books
  async searchBooks(query: string, limit?: number): Promise<Book[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (limit) params.append('limit', limit.toString());

    const response = await api.get<Book[]>(`/books/search?${params.toString()}`);
    return response;
  }

  // Get low stock books
  async getLowStockBooks(threshold = 10): Promise<Book[]> {
    const response = await api.get<Book[]>(`/books/low-stock?threshold=${threshold}`);
    return response;
  }

  // Update book stock
  async updateBookStock(id: number, quantity: number): Promise<Book> {
    const response = await api.patch<Book>(`/books/${id}/stock`, {
      stock_quantity: quantity,
    });
    return response;
  }

  // Upload book image
  async uploadBookImage(
    bookId: number,
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<Book> {
    const response = await api.upload<Book>(`/books/${bookId}/image`, file, onUploadProgress);
    return response;
  }

  // Get book image URL
  getBookImageUrl(book: Book): string | null {
    if (!book.image_url) return null;

    // If it's already a full URL, return as is
    if (book.image_url.startsWith('http')) {
      return book.image_url;
    }

    // Otherwise, construct full URL
    return `${process.env.NEXT_PUBLIC_API_URL}/static/images/books/${book.image_url}`;
  }

  // Get featured books
  async getFeaturedBooks(limit = 6): Promise<Book[]> {
    const response = await api.get<Book[]>(`/books/featured?limit=${limit}`);
    return response;
  }

  // Get books by category
  async getBooksByCategory(categoryId: number, limit?: number): Promise<Book[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/books/category/${categoryId}?${queryString}`
      : `/books/category/${categoryId}`;

    const response = await api.get<Book[]>(url);
    return response;
  }

  // Get books by author
  async getBooksByAuthor(authorId: number, limit?: number): Promise<Book[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/books/author/${authorId}?${queryString}`
      : `/books/author/${authorId}`;

    const response = await api.get<Book[]>(url);
    return response;
  }

  // Export books data
  async exportBooks(format: 'csv' | 'xlsx' = 'csv', filters?: BookFilters): Promise<void> {
    const params = new URLSearchParams();
    params.append('format', format);

    if (filters?.search) params.append('search', filters.search);
    if (filters?.author_id) params.append('author_id', filters.author_id.toString());
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());

    await api.download(`/books/export?${params.toString()}`, `books.${format}`);
  }
}

// Authors service
class AuthorsService {
  async getAuthors(): Promise<Author[]> {
    const response = await api.get<Author[]>('/authors');
    return response;
  }

  async getAuthorById(id: number): Promise<Author> {
    const response = await api.get<Author>(`/authors/${id}`);
    return response;
  }

  async createAuthor(
    authorData: Omit<Author, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Author> {
    const response = await api.post<Author>('/authors', authorData);
    return response;
  }

  async updateAuthor(id: number, authorData: Partial<Author>): Promise<Author> {
    const response = await api.put<Author>(`/authors/${id}`, authorData);
    return response;
  }

  async deleteAuthor(id: number): Promise<void> {
    await api.delete(`/authors/${id}`);
  }
}

// Categories service
class CategoriesService {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories');
    return response;
  }

  async getCategoryById(id: number): Promise<Category> {
    const response = await api.get<Category>(`/categories/${id}`);
    return response;
  }

  async createCategory(
    categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Category> {
    const response = await api.post<Category>('/categories', categoryData);
    return response;
  }

  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category> {
    const response = await api.put<Category>(`/categories/${id}`, categoryData);
    return response;
  }

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  }

  async getCategoryTree(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories/tree');
    return response;
  }
}

export const booksService = new BooksService();
export const authorsService = new AuthorsService();
export const categoriesService = new CategoriesService();

export default booksService;

import { supabase } from '@/lib/customSupabaseClient';

/**
 * Get all products from Supabase
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Maximum number of products to return
 * @param {number} params.offset - Number of products to skip
 * @param {string} params.sortBy - Field to sort by
 * @param {string} params.order - Sort order (ASC or DESC)
 * @returns {Promise<{products: Array, count: number}>}
 */
export async function getProducts({
  limit = 50,
  offset = 0,
  sortBy = 'created_at',
  order = 'ASC'
} = {}) {
  try {
    const query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('active', true)
      .range(offset, offset + limit - 1);

    // Apply sorting
    if (sortBy === 'price') {
      query.order('price_cents', { ascending: order === 'ASC' });
    } else {
      query.order(sortBy, { ascending: order === 'ASC' });
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Transform data to match expected format
    const products = (data || []).map(product => ({
      id: product.id,
      title: product.name,
      subtitle: product.subtitle,
      description: product.description,
      image: product.image_url,
      price_in_cents: product.price_cents,
      original_price_cents: product.original_price_cents,
      currency: product.currency || 'USD',
      purchasable: product.active,
      order: product.sort_order || 0,
      type: {
        value: product.type || 'service'
      },
      features: product.features || [],
      metadata: product.metadata || {}
    }));

    return {
      products,
      count: count || 0,
      offset,
      limit
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
}

/**
 * Get a single product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Product details
 */
export async function getProduct(id) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error('Product not found');
    }

    // Transform data to match expected format
    return {
      id: data.id,
      title: data.name,
      subtitle: data.subtitle,
      description: data.description,
      image: data.image_url,
      price_in_cents: data.price_cents,
      original_price_cents: data.original_price_cents,
      currency: data.currency || 'USD',
      purchasable: data.active,
      order: data.sort_order || 0,
      type: {
        value: data.type || 'service'
      },
      features: data.features || [],
      metadata: data.metadata || {},
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product details');
  }
}

/**
 * Create a new product (admin only)
 * @param {Object} product - Product data
 * @returns {Promise<Object>} Created product
 */
export async function createProduct(product) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: product.name,
        subtitle: product.subtitle,
        description: product.description,
        image_url: product.image_url,
        price_cents: product.price_cents,
        currency: product.currency || 'USD',
        type: product.type || 'service',
        features: product.features || [],
        metadata: product.metadata || {},
        active: product.active !== false,
        sort_order: product.sort_order || 0
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }
}

/**
 * Update a product (admin only)
 * @param {string} id - Product ID
 * @param {Object} updates - Product updates
 * @returns {Promise<Object>} Updated product
 */
export async function updateProduct(id, updates) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
}

/**
 * Delete a product (admin only)
 * @param {string} id - Product ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteProduct(id) {
  try {
    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
}
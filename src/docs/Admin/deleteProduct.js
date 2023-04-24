const deleteProduct = {
  // DEFINITION
  tags: ['Admin'], // REQUIRED
  description: 'Delete product', // REQUIRED
  operationId: 'deleteProduct', // REQUIRED

  // PARAMETERS
  parameters: [
    {
      name: 'id',
      in: 'path',
      schema: {
        $ref: '#/components/schemas/id',
      },
      required: true,
      description: 'ID of the product to be deleted',
    },
  ],

  // RESPONSES
  responses: {
    // SUCCESS
    200: {
      description: 'Product was deleted successfully', // REQUIRED
      content: {
        'application/json': {
          schema: {
            message: 'Deleted successfully',
          },
        },
      },
    },
    // SERVER ERROR
    500: {
      description: 'Server error', // REQUIRED
      content: {
        'application/json': {
          schema: {
            message: 'Server error',
          },
        },
      },
    },
    // BAD REQUEST
    404: {
      description: 'Not found', // REQUIRED
      content: {
        'application/json': {
          schema: {
            message: 'Product not found in my collection',
          },
        },
      },
    },
    // USER ALREADY EXISTS
  },
};

export default deleteProduct;

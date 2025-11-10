// Utilitários de autenticação (temporário - será substituído por autenticação real)

export const isAuthenticated = (): boolean => {
  // Verificar se tem token no localStorage
  const token = localStorage.getItem('auth_token')
  return !!token
}

export const login = (token: string) => {
  localStorage.setItem('auth_token', token)
}

export const logout = () => {
  localStorage.removeItem('auth_token')
}

export const getToken = (): string | null => {
  return localStorage.getItem('auth_token')
}

// Mock login para testes - REMOVER em produção
export const mockLogin = () => {
  localStorage.setItem('auth_token', 'mock_token_123')
  window.location.href = '/'
}

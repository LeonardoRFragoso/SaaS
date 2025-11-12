import api from './api'
import type { Organization } from '../types'

export const organizationService = {
  async getMyOrganization(): Promise<Organization> {
    const response = await api.get('/organizations/my_organization/')
    return response.data
  },
}

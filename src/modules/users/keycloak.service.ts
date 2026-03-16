import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class KeycloakService {
  private readonly logger = new Logger(KeycloakService.name);

  async createUserAndAssignRole(userData: any, password: string, roleName: string) {
    try {
      const tokenParams = new URLSearchParams();
      tokenParams.append('grant_type', 'client_credentials');
      tokenParams.append('client_id', process.env.KEYCLOAK_CLIENT_ID!);
      tokenParams.append('client_secret', process.env.KEYCLOAK_CLIENT_SECRET!);

      const tokenResponse = await axios.post(
        process.env.KEYCLOAK_TOKEN_URL!,
        tokenParams,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const adminToken = tokenResponse.data.access_token;
      this.logger.log('Admin token OK');

      const keycloakUserData = {
        username: userData.username,
        email: userData.email,
        firstName: userData.fullName,
        enabled: true,
        credentials: [
          { type: 'password', value: password, temporary: false },
        ],
      };

      const createUserResp = await axios.post(
        process.env.KEYCLOAK_ADMIN_USERS_URL!,
        keycloakUserData,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`User [${userData.username}] created on Keycloak`);

      const location = createUserResp.headers.location;
      const keycloakUserId = location.split('/').pop();

      const realmAdminUrl = process.env.KEYCLOAK_ADMIN_USERS_URL!.replace('/users', '');
      const roleResp = await axios.get(
        `${realmAdminUrl}/roles/${encodeURIComponent(roleName)}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      const role = roleResp.data;

      await axios.post(
        `${process.env.KEYCLOAK_ADMIN_USERS_URL}/${keycloakUserId}/role-mappings/realm`,
        [{ id: role.id, name: role.name }],
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`Role [${roleName}] assigned successfully`);
      
    } catch (error: any) {
      this.logger.error('===== KEYCLOAK ERROR =====');
      if (error.response) {
        this.logger.error(`STATUS: ${error.response.status}`);
        this.logger.error(`DATA: ${JSON.stringify(error.response.data)}`);
      } else {
        this.logger.error(error.message);
      }
      this.logger.error('==========================');
    }
  }
}
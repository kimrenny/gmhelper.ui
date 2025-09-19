import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, map } from 'rxjs';
import { TokenService } from './token.service';
import { ApiResponse } from '../models/api-response.model';
import { environment } from 'src/environments/environment';
import { UserDetails } from '../models/user.model';
import { LanguageCode } from '../models/languages.model';

enum Errors {
  UserBlocked = 'User is blocked.',
  UserNotFound = 'User not found.',
  InvalidData = 'Invalid data.',
  InvalidToken = 'Invalid token.',
  Unauthorized = 'Unauthorized',
  UserTokenNotActive = 'User token is not active.',
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly errors = new Set<string>(Object.values(Errors));

  private readonly api = `${environment.apiUrl}`;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  loadUserDetails(token: string): Observable<UserDetails> {
    return this.http
      .get<ApiResponse<UserDetails>>(`${this.api}/user/details`, {
        headers: this.tokenService.createAuthHeaders(token),
      })
      .pipe(
        map((response) => {
          const userDetails = response.data;

          if (userDetails.avatar) {
            userDetails.avatar = `data:image/jpeg;base64,${userDetails.avatar}`;
          }

          userDetails.language = this.normalizeLanguage(userDetails.language);

          return userDetails;
        })
      );
  }

  updateUserData(formData: FormData): Observable<any> {
    return this.tokenService.getToken$().pipe(
      switchMap((token) =>
        this.http.patch(`${this.api}/user/profile`, formData, {
          headers: this.tokenService.createAuthHeaders(token),
        })
      )
    );
  }

  uploadAvatar(avatar: File): Observable<any> {
    return this.tokenService.getToken$().pipe(
      switchMap((token) => {
        const formData = new FormData();
        formData.append('avatar', avatar);

        return this.http.post(`${this.api}/user/avatar`, formData, {
          headers: this.tokenService.createAuthHeaders(token),
        });
      })
    );
  }

  updateLanguage(language: LanguageCode): Observable<any> {
    return this.tokenService.getToken$().pipe(
      switchMap((token) => {
        const url = `${this.api}/user/profile/language`;
        const body = { language: language.toUpperCase() };
        const headers = this.tokenService.createAuthHeaders(token);
        return this.http.patch(url, body, { headers });
      })
    );
  }

  private normalizeLanguage(lang: string): UserDetails['language'] {
    const listLangs: UserDetails['language'][] = [
      'en',
      'de',
      'fr',
      'ja',
      'ko',
      'ru',
      'ua',
      'zh',
    ];

    if (!lang) return 'en';
    const normalized = lang.toLowerCase() as UserDetails['language'];
    return listLangs.includes(normalized) ? normalized : 'en';
  }
}
